//
// grb_data lambda.
//
//  It is triggered by an SNS topic generated by incoming L1B netcdf files
//
// Pat Cappelaere, IBM Federal
//
// const { StoreMessage } = require('./store.js')
// const { PublishMessage } = require('./publish.js')
// const { KafkaInit, KafkaDisconnect } = require('./kafka.js')
// const { IndexMessage } = require('./es.js')

const moment = require('moment')
const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3')
const { GetObjectContents } = require('./get.js')
const { IndexCid, IndexEvent } = require('./es.js')
const { KafkaInit, KafkaPublish } = require('./kafka.js')
const CID = require('cids')
const multihashing = require('multihashing-async')
const { StoreR2 } = require('./store.js')

// const assert = require('assert')

// Set the AWS Region.
const AWS_REGION = process.env.AWS_REGION || 'us-east-1'
const AWS_ACCOUNT = process.env.AWS_ACCOUNT

// Create an Amazon S3 service client object.
const s3Client = new S3Client({ AWS_REGION })

// Get the LastModified timestamp from S3 Object
//
const LastModified = async (bucket, key) => {
  // console.log('lastModified bucket/key', bucket, key)
  const input = { Bucket: bucket, Key: key }
  try {
    const command = new HeadObjectCommand(input)
    const response = await s3Client.send(command)
    const lastModified = response.LastModified.toISOString()
    // console.log('lastModified:', lastModified)
    return lastModified
  } catch (err) {
    console.error(err)
    return new Date().toISOString()
  }
}

//
// Parse TimeStamp extracted from the file name and returns an ISOString
//
const ToTimeStamp = (str) => {
  const yyyy = str.substring(0, 4)
  const ddd = parseInt(str.substring(4, 7), 10)
  const hh = parseInt(str.substring(7, 9), 10)
  const mm = parseInt(str.substring(9, 11), 10)
  const ss = parseInt(str.substring(11, 13), 10)
  const dt = new Date(yyyy)
  dt.setUTCDate(ddd)
  dt.setUTCHours(hh, mm, ss)
  return dt.toISOString()
}

const ProcessEvent = async (record) => {
  // Get the object from the event and show its content type
  const { eventTime } = record
  const bucket = record.s3.bucket.name
  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '))
  const params = {
    Bucket: bucket,
    Key: key
  }

  // Splice the key to get the filename
  const arr = params.Key.split('/')
  const fileName = arr[arr.length - 1]
  const ext = fileName.split('.')[1]
  if (ext !== 'nc' && ext != 'tar') {
    console.log(`ignoring ext: ${ext}, for file: ${fileName}`)
    return null
  }

  const fields = fileName.split('_')
  const environment = fields[0]
  const instrumentProd = fields[1]
  const satellite = fields[2]
  const startTime = fields[3].substring(1)
  let endTime = fields[4].substring(1)
  let creationTime = null

  if (fields.length > 5) {
    creationTime = fields[5].split('.')[0].substring(1)
  } else {
    const marker = fields[4].charAt(0)
    if (marker === 'c') {
      creationTime = fields[4].split('.')[0].substring(1)
      endTime = null
    } else {
      endTime = fields[4].split('.')[0].substring(1)
    }
  }

  const fields2 = instrumentProd.split('-')
  let instrument = fields2[0]
  let dsn = instrumentProd
  let level

  if (bucket.includes('plt')) {
    level = arr[2].toUpperCase()
    if (level === 'SCMI') instrument = arr[3]
  } else {
    level = arr[2].toUpperCase()

    instrument = fields2.shift()
    if (level === 'SCMI') instrument = arr[4]
  }

  const lastModifiedTime = await LastModified(bucket, key)
  const imagingDelay = 0
  const creationDelay = 0
  const storageDelay = 0
  const notifyDelay = 0
  const insertDelay = 0
  const insertTime = moment().utc().toISOString()

  let mode = 'NA'
  if (instrument === 'ABI') {
    const dsnArr = dsn.split('-')
    mode = dsnArr.pop().slice(0, 2)
    dsn = dsnArr.join('-')
  }
  const eventMsg = {
    bucket,
    key,
    fileName,
    fileSize: record.s3.object.size,
    startTime: ToTimeStamp(startTime),
    endTime,
    creationTime,
    lastModifiedTime,
    eventTime,
    insertTime,
    environment,
    satellite,
    level,
    instrument,
    dsn,
    mode,
    imagingDelay,
    creationDelay,
    storageDelay,
    notifyDelay,
    insertDelay
  }

  if (creationTime) eventMsg.creationTime = ToTimeStamp(creationTime)

  if (endTime) eventMsg.endTime = ToTimeStamp(endTime)

  const mcreationTime = moment(eventMsg.creationTime, 'YYYY-MM-DDTHH:mm:ss')
  const mendTime = moment(eventMsg.endTime, 'YYYY-MM-DDTHH:mm:ss')
  const mstartTime = moment(eventMsg.startTime, 'YYYY-MM-DDTHH:mm:ss')
  const mlastModifiedTime = moment(eventMsg.lastModifiedTime, 'YYYY-MM-DDTHH:mm:ss')
  const meventTime = moment(eventMsg.eventTime, 'YYYY-MM-DDTHH:mm:ss')
  const minsertTime = moment(eventMsg.insertTime, 'YYYY-MM-DDTHH:mm:ss')

  if (endTime === null) {
    eventMsg.imagingDelay = 0
    eventMsg.creationDelay = 0
  } else {
    // imagingDelay = endTime - startTime
    eventMsg.imagingDelay = moment.duration(mendTime.diff(mstartTime)).asSeconds()
    // creationDelay = creationTime - endTime
    eventMsg.creationDelay = moment.duration(mcreationTime.diff(mendTime)).asSeconds()
  }

  // storageDelay = lastModifiedTime - creationTime
  eventMsg.storageDelay = moment.duration(mlastModifiedTime.diff(mcreationTime)).asSeconds()
  // notifyDelay = eventTime - lastModifiedTime
  eventMsg.notifyDelay = moment.duration(meventTime.diff(mlastModifiedTime)).asSeconds()
  // insertDelay = insertTime - eventTime
  eventMsg.insertDelay = moment.duration(minsertTime.diff(meventTime)).asSeconds()

  return eventMsg
}

//
// Compute CID for data content
//
const GenerateCid = async (bytes) => {
  // const hash = await sha256.digest(bytes)
  const hash = await multihashing(bytes, 'sha2-256')

  const cid = new CID(1, 'raw', hash)
  return cid.toString()
}

const handler = async (event) => {
  // console.log(JSON.stringify(event, null, '\t'))

  try {
    await KafkaInit()

    const Record = event.Records[0]
    let s3EventRecord
    if (Record.Sns) {
      const Message = Record.Sns.Message
      const records = JSON.parse(Message)
      s3EventRecord = records.Records[0]
      console.log(`new record ${JSON.stringify(s3EventRecord, null, '\t')}`)
    } else {
      s3EventRecord = Record
    }

    const eventInfo = await ProcessEvent(s3EventRecord)
    // console.log(`eventInfo ${JSON.stringify(eventInfo, null, '\t')}`)

    // Index S3 Store - it is already stored in S3
    const contents = await GetObjectContents(eventInfo.bucket, eventInfo.key)
    const cid = await GenerateCid(contents)
    const storageClass = 's3'
    const size = contents.length
    const mtime = eventInfo.lastModifiedTime
    const contentType = 'application/x-netcdf'
    const account = AWS_ACCOUNT
    const bucket = eventInfo.bucket
    const key = eventInfo.key

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

    await IndexCid(doc)

    // Store to R2 Store and Index it
    await StoreR2(eventInfo.key, contents, contentType)

    // Index Event
    eventInfo.cid = cid
    await IndexEvent(eventInfo)

    // Publish Message
    const msg = {
      cid,
      sat: eventInfo.satellite,
      level: eventInfo.level,
      instrument: eventInfo.instrument,
      dsn: eventInfo.dsn,
      mode: eventInfo.mode,
      fileName: eventInfo.fileName,
      size: eventInfo.fileSize,
      type: contentType
    }

    const topic = `grb.${eventInfo.satellite}.${eventInfo.instrument}`
    await KafkaPublish(topic, JSON.stringify(msg))

    const response = {
      statusCode: 200,
      body: 'OK'
    }
    // await KafkaDisconnect()
    return response
  } catch (err) {
    console.error(err)
    const response = {
      statusCode: 500,
      body: `Error ${err}`
    }

    // await KafkaDisconnect()
    return response
  }
}

module.exports.handler = handler
module.exports.ProcessEvent = ProcessEvent
