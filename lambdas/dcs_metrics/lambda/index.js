const { XMLParseString } = require('./xmlparse.js')
const { IndexMetricsDocument } = require('./es.js')

const moment = require('moment')
const assert = require('assert')

const ParseXml = async (xmlMessage) => {
  const json = await XMLParseString(xmlMessage)
  const LrgsStatusSnapshot = json.LrgsStatusSnapshot
  const Quality = LrgsStatusSnapshot.Quality
  LrgsStatusSnapshot.Quality = Quality[Quality.length - 1]

  const DownLink = LrgsStatusSnapshot.DownLink
  for (let d in DownLink) {
    // console.log(d)
    if (DownLink[d].Quality) {
      DownLink[d].Quality = DownLink[d].Quality[DownLink[d].Quality.length - 1]
      DownLink[d].LastMsgRecvTime = moment.unix(DownLink[d].LastMsgRecvTime).format()
    }
  }

  LrgsStatusSnapshot.SystemTime = moment(LrgsStatusSnapshot.SystemTime).format()
  LrgsStatusSnapshot.ArchiveStatistics.oldestMsgTime = moment.unix(LrgsStatusSnapshot.ArchiveStatistics.oldestMsgTime).format()

  console.log(JSON.stringify(LrgsStatusSnapshot, null, '\t'))
  return LrgsStatusSnapshot
}

exports.handler = async (event) => {

  try {
    const SNSRecord = event.Records[0]

    const topic = SNSRecord.Sns.TopicArn
    const xmlMessage = SNSRecord.Sns.Message
    const json = await ParseXml(xmlMessage)

    IndexMetricsDocument(json)

    const response = {
      statusCode: 200,
      body: 'OK'
    }
    return response
  } catch (err) {
    console.error(err)
    const response = {
      statusCode: 500,
      body: `Error ${err}`
    }
    return response;
  }
}