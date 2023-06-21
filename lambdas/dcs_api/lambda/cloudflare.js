// Manage CloudFlare buckets
// Pat Cappelaere, IBM FEderal
//
const { r2Client } = require('./s3.js')
const { ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const MaxKeys = 1000
// S3 listobject
const ListObjects = async (Bucket) => {
    const input = { // ListObjectsV2Request
        Bucket, // required
        MaxKeys
    }
    const command = new ListObjectsV2Command(input)
    const response = await r2Client.send(command)
    return response
}

const DeleteObject = async (Bucket, Key) => {
    const input = { // ListObjectsV2Request
        Bucket, // required
        Key
    }
    const command = new DeleteObjectCommand(input)
    const response = await r2Client.send(command)
    return response
}

const EmptyBucket = async (bucket) => {
    let length = MaxKeys
    while (length) {
        const contents = await ListObjects(bucket)
        // console.log(contents)
        if (contents && contents.Contents) {
            length = contents.Contents.length
        } else {
            length = 0
        }

        if (length) {
            for await (object of contents.Contents) {
                console.log(`delete ${object.Key}`)
                const result = await DeleteObject(bucket, object.Key)
                // console.log(result)
            }
        }
    }
}

// EmptyBucket('geocloud-grb')
EmptyBucket('geocloud-dcs')
