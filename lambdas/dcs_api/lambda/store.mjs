//
// Stores Data
//
// Patrice G Cappelaere, IBM Consulting
//
import fs from 'fs'

import * as raw from 'multiformats/codecs/raw'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3" // ES Modules import
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { ParseDcpToJSON, BrotliEncodeFromXML } from './dcp.js'
import { ParsePDTFile } from './pdts.js'
import { IndexCid, SearchCid } from './es.old.js'

import zlib from 'zlib'
import moment from 'moment'
import { getEnvironmentData } from 'worker_threads'

const AWS_REGION = process.env.AWS_REGION || 'us-east-1'
const AWS_ACCOUNT = process.env.AWS_ACCOUNT

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_KEY = process.env.R2_KEY
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const S3_BUCKET = 'geocloud-dcs'

const s3Client = new S3Client({ region: AWS_REGION })

const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_KEY,
        secretAccessKey: R2_SECRET_ACCESS_KEY
    },
})

//
// Compute CID for data content
//
const GenerateCid = async (bytes) => {
    const hash = await sha256.digest(bytes)
    const cid = CID.create(1, 'raw', hash)
    return cid.toString()
}

//
// Generate Bucket Key Name from Json
//
const GetKeyName = (json) => {
    console.log(json)
    const sat = json.sat
    const agency = json.agency || 'NA'
    const platformId = json.platformId
    const time = moment(json.LocalRecvTime)
    const year = time.year()
    const doy = time.dayOfYear().toString().padStart(3, '0')
    const timestamp = time.format('YYYYMMDDHHmmss')

    const dir = `dcs/${sat}/${year}/${doy}/${agency}/${platformId}`
    const fileName = `dcs_${sat}_${platformId}_${timestamp}.br`
    const key = `${dir}/${fileName}`
    return key
}

const GetData = async (address) => {
    return new Promise(async (resolve, reject) => {
        let client
        switch (address.class) {
            case 'r2':
                client = r2Client
                break
            case 's3':
                client = s3Client
                break
            default:
                console.error(`Invalid Storage Class ${address.class}`)
                return
        }
        const input = {
            Bucket: address.bucket,
            Key: address.key
        }
        try {
            const command = new GetObjectCommand(input)
            const response = await client.send(command)
            const bytes = await response.Body.transformToByteArray()

            const brotli = zlib.createBrotliDecompress()
            brotli.write(bytes)
            brotli.on('data', function (data) {
                console.log(data.toString())
                const json = JSON.parse(data.toString())
                resolve(json)
            })

            console.log(bytes.length)
        } catch (err) {
            console.error(err)
            return reject(err)
        }
    })
}

const StoreData = async (storageClass, bucket, key, contents, contentType) => {
    let client, account
    switch (storageClass) {
        case 's3':
            client = s3Client
            account = AWS_ACCOUNT
            break
        case 'r2':
            client = r2Client
            account = R2_ACCOUNT_ID
            break
        default:
            console.error(`Invalid Storage Class ${storageClass}`)
            return
    }

    console.log(`Storing ${storageClass} : ${bucket} / ${key}`)
    const input = {
        Bucket: bucket,
        Key: key,
        Body: contents,
        ContentType: contentType
    }
    try {
        const command = new PutObjectCommand(input)
        const response = await client.send(command)
        console.log(response)

        const cid = await GenerateCid(contents)
        const size = contents.length
        const mtime = moment().valueOf()
        const doc = {
            cid,
            class: storageClass,
            account,
            bucket,
            key,
            size,
            mtime,
            type: contentType
        }
        console.log(doc)
        await IndexCid(doc)
        return response.$metadata.httpStatusCode
    } catch (err) {
        console.error(err)
        return 500  // internal error
    }
}

const StoreS3 = async (bucket, key, contents, contentType) => {
    await StoreData('s3', bucket, key, contents, contentType)
    console.log(`Store in S3 bucket: ${bucket}, key:${key} ${contentType}`)
}

const StoreR2 = async (bucket, key, contents, contentType) => {
    await StoreData('r2', bucket, key, contents, contentType)
    console.log(`Store in R2 bucket: ${bucket}, key: ${key} ${contentType}`)
}

export async function Fetch(cid) {
    console.log(`fetching ${cid}...`)
    const search = await SearchCid(cid)
    console.log(`Got ${search}`)
    if (search) {
        const address = search[0]
        const data = await GetData(address)
        return data
    } else {
        return null
    }
}

async function PresignedUrl(client, bucket, key) {
    //const url = await s3.getSignedUrlPromise('getObject', { Bucket: bucket, Key: key, Expires: 3600 })
    const url = await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 3600 })
    console.log(url)
    return url
}

async function R2PresignedUrl(bucket, key) {
    return await PresignedUrl(r2Client, bucket, key)
}
async function S3PresignedUrl(bucket, key) {
    return await PresignedUrl(s3Client, bucket, key)
}
export {
    StoreS3,
    StoreR2,
    GenerateCid,
    R2PresignedUrl,
    S3PresignedUrl
}

// module.exports.StoreData = StoreData
// module.exports.StoreS3 = StoreS3
// module.exports.StoreR2 = StoreR2

const test = async () => {
    const cid = 'bafkreidhxzoz7zmvf5nptsr7nvfjkk55lbak2nv7jcse7kk5oy4jtemnia'
    const data = Fetch(cid)
}

const test2 = async () => {
    try {
        await ParsePDTFile()

        const goesXML = fs.readFileSync('./tests/goes_dcp.xml', 'utf-8')
        // console.log(goesXML)

        const json = await ParseDcpToJSON(goesXML)

        const str = JSON.stringify(json)
        const data = zlib.brotliCompressSync(str)
        const key = GetKeyName(json)
        console.log(`key: ${key}`)

        await StoreS3(S3_BUCKET, key, data, 'application/br')
        // await StoreR2(S3_BUCKET, key, data, 'application/br')

    } catch (err) {
        console.error(err)
    }
}
// test()

const test3 = async () => {
    const bucket = 'geocloud-dcs'
    const key = 'dcs/goes/2023/003/USGS01/DDE5F57E/dcs_goes_DDE5F57E_20230103000328.br'
    const url1 = await R2PresignedUrl(bucket, key)
    // const url2 = await S3PresignedUrl(bucket, key)
    console.log(url1)

    const cid = await GenerateCid(new Uint8Array(url1))
    fs.writeFileSync(cid, url1)
    console.log(cid)
    // curl -X PUT url1 --output test.br
}
// test3()