//
// Get S3 Object Contents
//
// Pat Cappelaere, IBM Consulting
//
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3') // ES Modules import

const AWS_REGION = process.env.AWS_REGION
const s3Client = new S3Client({ region: AWS_REGION })

const StreamToBuffer = async (stream) => new Promise((resolve, reject) => {
  const chunks = []
  stream.on('data', (chunk) => chunks.push(chunk))
  stream.on('error', reject)
  stream.on('end', () => resolve(Buffer.concat(chunks)))
})

const GetObjectContents = async (bucket, key) => {
  const input = {
    Bucket: bucket,
    Key: key
  }
  try {
    const command = new GetObjectCommand(input)
    const response = await s3Client.send(command)
    const { Body } = response

    const contents = await StreamToBuffer(Body)
    console.log(bucket, key, contents.length)
    return contents
  } catch (err) {
    console.error(err)
  }
}

module.exports.GetObjectContents = GetObjectContents
