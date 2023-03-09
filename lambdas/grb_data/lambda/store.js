const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3') // ES Modules import
const { IndexCid } = require('./es.js')

const CID = require('cids')
const multihashing = require('multihashing-async')
const moment = require('moment')
const { assert } = require('console')

const S3_GRB_BUCKET = process.env.S3_GRB_BUCKET
const R2_GRB_BUCKET = process.env.R2_GRB_BUCKET
const AWS_ACCOUNT = process.env.AWS_ACCOUNT
const AWS_REGION = process.env.AWS_REGION
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_KEY = process.env.R2_KEY
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY

assert(S3_GRB_BUCKET, 'Undefined env S3_GRB_BUCKET')
assert(R2_GRB_BUCKET, 'Undefined env R2_GRB_BUCKET')
assert(AWS_ACCOUNT, 'Undefined env AWS_ACCOUNT')
assert(AWS_REGION, 'Undefined env AWS_REGION')
assert(R2_ACCOUNT_ID, 'Undefined env R2_ACCOUNT_ID')
assert(R2_KEY, 'Undefined env R2_KEY')
assert(R2_SECRET_ACCESS_KEY, 'Undefined env R2_SECRET_ACCESS_KEY')

const s3Client = new S3Client({ region: AWS_REGION })

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_KEY,
    secretAccessKey: R2_SECRET_ACCESS_KEY
  }
})

//
// Compute CID for data content
//
const GenerateCid = async (str) => {
  const bytes = new TextEncoder('utf8').encode(str)

  const hash = await multihashing(bytes, 'sha2-256')
  const cid = new CID(1, 'raw', hash)
  return cid.toString()
}

//
// Generate Bucket Key Name from Json
//
const GetKeyName = (json) => {
  // console.log(json)
  const sat = json.sat
  const platformId = json.platformId
  const time = moment(json.LocalRecvTime)
  const year = time.year()
  const doy = time.dayOfYear().toString().padStart(3, '0')
  const timestamp = time.format('YYYYMMDDHHmmss')

  const dir = `dcs/${sat}/${year}/${doy}/${platformId}`
  const fileName = `dcs_${sat}_${platformId}_${timestamp}.br`
  const key = `${dir}/${fileName}`
  return key
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
    await client.send(command)
    // const response = await client.send(command)
    // console.log(response)

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

    return await IndexCid(doc)
  } catch (err) {
    console.error(err)
    return 500 // internal error
  }
}

const StoreS3 = async (key, contents, contentType) => {
  const bucket = S3_GRB_BUCKET
  await StoreData('s3', bucket, key, contents, contentType)
  // console.log(`Store in S3 bucket: ${bucket}, key:${key} ${contentType}`)
}

const StoreR2 = async (key, contents, contentType) => {
  const bucket = R2_GRB_BUCKET
  await StoreData('r2', bucket, key, contents, contentType)
  // console.log(`Store in R2 bucket: ${bucket}, key: ${key} ${contentType}`)
}

const StoreMessage = async (json) => {
  const contents = JSON.stringify(json)
  const cid = await GenerateCid(contents)
  const key = GetKeyName(json)
  const contentType = 'application/json'

  console.log(`Storing msg len: ${contents.length}, cid:${cid}, key:${key}`)
  await StoreR2(key, contents, contentType)
  await StoreS3(key, contents, contentType)
}

module.exports.StoreMessage = StoreMessage
module.exports.StoreR2 = StoreR2
module.exports.StoreS3 = StoreS3
