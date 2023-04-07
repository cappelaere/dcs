const fs = require('fs')
const path = require('path')

const { handler, ParseXml } = require('../lambda/index.js')

const testSNSGoes = async () => {
    const json = fs.readFileSync(path.join(__dirname, 'data/sns_goes.json'), 'utf-8')
    await handler(JSON.parse(json))
}

const parseSNSGoes = async () => {
    const event = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/sns_goes.json'), 'utf-8'))
    const SNSRecord = event.Records[0]

    const topic = SNSRecord.Sns.TopicArn
    const xmlMessage = SNSRecord.Sns.Message
    const json = await ParseXml(topic, xmlMessage)
    console.log(json)
}

const testSNSIridium = async () => {
    const json = fs.readFileSync(path.join(__dirname, 'data/sns_iridium.json'), 'utf-8')
    await handler(JSON.parse(json))
}

const test = async () => {
    // await testSNSGoes()
    // await testSNSIridium()
    await parseSNSGoes()
}

test()
