const fs = require('fs')
const { handler } = require('../index.js')

const test_searchdcs = async () => {
    const json = JSON.parse(fs.readFileSync('./tests/data/searchdcs.json', 'utf-8'))
    const result = await handler(json, null, null)
    console.log(result)

}

const test = async () => {
    await test_searchdcs()
}
test()