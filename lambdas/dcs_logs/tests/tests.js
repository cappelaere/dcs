const fs = require('fs')
const path = require('path')

const { handler } = require('../lambda/index.js')

const testEvent = async () => {
    const json = fs.readFileSync(path.join(__dirname, 'data/event.json'), 'utf-8')
    await handler(JSON.parse(json))
}

const test = async () => {
    await testEvent()
}

test()
