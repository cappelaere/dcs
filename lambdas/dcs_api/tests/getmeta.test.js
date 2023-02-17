const fs = require('fs')
const { handler } = require('../lambda/index.js')

const getmeta = async () => {
    const json = JSON.parse(fs.readFileSync('./data/getmeta.json', 'utf-8'))
    const result = await handler(json, null, null)
    console.log(result)

}

const test = async () => {
    await getmeta()
}
test()