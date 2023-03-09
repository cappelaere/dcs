//
// Lambda to get the logs frm SNS topic and send them to ElasticSaearch
//
// Pat Cappelaere, IBM Consulting
//
const { IndexLogDocument } = require('./es.js')
const moment = require('moment')

exports.handler = async (event) => {
  try {
    const SNSRecord = event.Records[0]

    const msg = SNSRecord.Sns.Message

    const timestamp = msg.slice(8, 28).trim()
    const ts = moment(timestamp, 'YYYY/MM/DD-HH:mm:ss')

    const log = {
      type: msg.slice(0, 7).trim(),
      timestamp: ts.format(),
      content: msg.slice(28, msg.length)
    }
    // console.log(log)

    IndexLogDocument(log)

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
    return response
  }
}
