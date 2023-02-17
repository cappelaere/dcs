const fs = require('fs')
const { handler } = require('../lambda/index.js')

const test_getcid = async () => {
    const json = JSON.parse(fs.readFileSync('./data/getcid.json', 'utf-8'))
    const result = await handler(json, null, null)
    console.log(result)

}

const test = async () => {
    await test_getcid()
}
test()