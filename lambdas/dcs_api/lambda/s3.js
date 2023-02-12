
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const assert = require('assert')

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_KEY = process.env.R2_KEY
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const AWS_REGION = process.env.AWS_REGION

assert(R2_ACCOUNT_ID)
assert(R2_KEY)
assert(R2_SECRET_ACCESS_KEY)
assert(AWS_REGION)

const s3Client = new S3Client({ region: AWS_REGION })

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_KEY,
    secretAccessKey: R2_SECRET_ACCESS_KEY
  }
})

const PresignedUrl = async (client, bucket, key) => {
  // const url = await s3.getSignedUrlPromise('getObject', { Bucket: bucket, Key: key, Expires: 3600 })
  const url = await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 3600 })
  console.log(url)
  return url
}
const R2PresignedUrl = async (bucket, key) => {
  return await PresignedUrl(r2Client, bucket, key)
}

const S3PresignedUrl = async (bucket, key) => {
  return await PresignedUrl(s3Client, bucket, key)
}

module.exports.S3PresignedUrl = S3PresignedUrl
module.exports.R2PresignedUrl = R2PresignedUrl
