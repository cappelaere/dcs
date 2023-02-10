//
// dcs_data lambda.
//
//  It is triggered by an SNS topic generated by incoming DCS-GOES or DCS_IRIDIUM topics
//
// Pat Cappelaere, IBM Federal
//
const { XMLParseString } = require('./xmlparse.js')
const { StoreMessage } = require('./store.js')
const { PublishMessage } = require('./publish.js')
const { KafkaInit, KafkaDisconnect } = require('./kafka.js')
const { IndexMessage } = require('./es.js')

const moment = require('moment')
const assert = require('assert')

const DCS_GOES_ARN = process.env.DCS_GOES_ARN
const DCS_IRIDIUM_ARN = process.env.DCS_IRIDIUM_ARN
const DCS_GOES = 'DCS_GOES'
const DCS_IRIDIUM = 'DCS_IRIDIUM'

assert(DCS_GOES_ARN)
assert(DCS_IRIDIUM_ARN)

const ParseXml = async (topic, xmlMessage) => {
  const json = await XMLParseString(xmlMessage)

  const DcpMsg = json.DcpMsg
  DcpMsg.LocalRecvTime = moment(DcpMsg.LocalRecvTime, 'YYYY/DDD HH:mm:ss.SSSS').format()

  if (DcpMsg.CarrierStart) DcpMsg.CarrierStart = moment(DcpMsg.CarrierStart, 'YYYY/DDD HH:mm:ss.SSSS').format()
  if (DcpMsg.CarrierStop) DcpMsg.CarrierStop = moment(DcpMsg.CarrierStop, 'YYYY/DDD HH:mm:ss.SSSS').format()
  if (DcpMsg.DomsatTime) DcpMsg.DomsatTime = moment(DcpMsg.DomsatTime, 'YYYY/DDD HH:mm:ss.SSSS').format()
  if (DcpMsg.XmitTime) DcpMsg.XmitTime = moment(DcpMsg.XmitTime, 'YYYY/DDD HH:mm:ss.SSSS').format()

  if (topic.indexOf(DCS_GOES) >= 0) {
    DcpMsg.sat = 'goes'
  } else if (topic.indexOf(DCS_IRIDIUM) >= 0) {
    DcpMsg.sat = 'iridium'
  } else {
    throw new Error(`Invalid topic ${topic}`)
  }

  return DcpMsg
}

exports.handler = async (event) => {
  try {
    await KafkaInit()

    const SNSRecord = event.Records[0]

    const topic = SNSRecord.Sns.TopicArn
    const xmlMessage = SNSRecord.Sns.Message
    const json = await ParseXml(topic, xmlMessage)

    await StoreMessage(json)
    await PublishMessage(json)
    await IndexMessage(json)

    const response = {
      statusCode: 200,
      body: 'OK'
    }
    await KafkaDisconnect()
    return response
  } catch (err) {
    console.error(err)
    const response = {
      statusCode: 500,
      body: `Error ${err}`
    }

    await KafkaDisconnect()
    return response
  }
}
