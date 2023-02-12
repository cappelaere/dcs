const fs = require('fs')
const path = require('path')

const { handler } = require('../index.js')

const testEvent2 = async () => {
    const json = fs.readFileSync(path.join(__dirname, 'data/event2.json'), 'utf-8')
    await handler(JSON.parse(json))
}

const testEvent1 = async () => {
    const json = fs.readFileSync(path.join(__dirname, 'data/event1.json'), 'utf-8')
    await handler(JSON.parse(json))
}

const test = async () => {
    await testEvent1()
    await testEvent2()
}

test()