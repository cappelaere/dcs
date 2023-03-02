const { ProcessEvent } = require('../lambda/index.js')
const fs = require('fs')

const testProcessEvent = async (fileName) => {
    const json = JSON.parse(fs.readFileSync(fileName, 'utf-8'))
    console.log(json)
    const s3EventRecord = json.Records[0]
    const info = await ProcessEvent(s3EventRecord)
    console.log(info)
}

const test = async () => {
    const fileName = './tests/test3.json'
    await testProcessEvent(fileName)
}
test()