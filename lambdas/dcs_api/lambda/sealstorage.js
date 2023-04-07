const axios = require('axios').default
const fs = require('fs')
const assert = require('assert')

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

const SEAL_CLIENT_ID = process.env.SEAL_CLIENT_ID
const SEAL_CLIENT_SECRET = process.env.SEAL_CLIENT_SECRET
const AWS_REGION = process.env.AWS_REGION || 'us-east-1'

assert(SEAL_CLIENT_ID)
assert(SEAL_CLIENT_SECRET)

const S3_PATH = "Maritime/IAM/S3/IAM_S3_GOES_R"
const S3_Bucket = "Maritime"
const S3_Prefix = "IAM/S3/IAM_S3_GOES_R"

// work around cannot sign first certificate
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const SEAL_ACCESS_KEY_ID = process.env.SEAL_ACCESS_KEY_ID
const SEAL_SECRET_ACCESS_KEY = process.env.SEAL_SECRET_ACCESS_KEY
assert(SEAL_ACCESS_KEY_ID)
assert(SEAL_SECRET_ACCESS_KEY)

const options = {
  Region: AWS_REGION,
  endpoint: "https://maritime.sealstorage.io/api/v0/s3",
  credentials: { SEAL_ACCESS_KEY_ID, SEAL_SECRET_ACCESS_KEY },
  //tls: false
  sslEnabled: true,
  signatureVersion: 'v4'
}
console.log(options)

const s3Client = new S3Client(options)

const StoreSeal = async (bucket, key, contents, contentType) => {
  const input = {
    Bucket: bucket,
    Key: key,
    Body: contents,
    ContentType: contentType
  }
  try {
    const command = new PutObjectCommand(input)
    const response = await s3Client.send(command)
    console.log(response)
    console.log(`Store in Seal bucket: ${bucket}, key: ${key} ${contentType}`)
  } catch (err) {
    console.error(err)
  }
}

const GetToken = async () => {
  const url = "https://maritime.sealstorage.io/api/v0/oauth/token"
  var options = {
    method: 'POST',
    url,
    headers: { 'content-type': 'application/json' },
    data: {
      "client_id": SEAL_CLIENT_ID,
      "client_secret": SEAL_CLIENT_SECRET,
      "audience": "https://maritime.sealstorage.io",
      "grant_type": "client_credentials"
    }
  }

  return new Promise((resolve, reject) => {
    axios.request(options).then(async (response) => {
      return resolve(response.data.access_token)
    })
  }).catch(function (error) {
    console.error(error)
  })
}

const test = async () => {
  //const token = await GetToken()
  //console.log(token)
  const goes = fs.readFileSync('../tests/data/dcs_goes_CE44B7BA_20230314042215.json', 'utf-8')
  const key = `${S3_Prefix}/dcs/dcs_goes_CE44B7BA_20230314042215.json`
  await StoreSeal(S3_Bucket, key, goes, 'application/json')

}

test()