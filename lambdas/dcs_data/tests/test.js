const fs = require('fs')
const path = require('path')

const { handler } = require('../lambda/index.js')

const testSNSGoes = async () => {
    const json = fs.readFileSync(path.join(__dirname, 'data/sns_goes.json'), 'utf-8')
    await handler(JSON.parse(json))
}

const testSNSIridium = async () => {
    const json = fs.readFileSync(path.join(__dirname, 'data/sns_iridium.json'), 'utf-8')
    await handler(JSON.parse(json))
}

const test = async () => {
    // await testSNSGoes()
    await testSNSIridium()
}

test()
