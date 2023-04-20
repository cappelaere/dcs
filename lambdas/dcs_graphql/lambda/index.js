const goesDcps = require('GoesDcps.json')
const grbs = require('Grbs.json')

const { getGoesDcp } = require('./getGoesDcp.js')
const { getGoesDcps } = require('./getGoesDcps.js')
const { getGrb } = require('./getGrb.js')
const { getGrbs } = require('./getGrbs.js')
const { newGrb } = require('./newGrb.js')
const { newDcp } = require('./newDcp.js')

exports.handler = async (event) => {
    console.log('Received event {}', JSON.stringify(event, 2))
    let result
    let limit = event.arguments.limit
    switch (event.field) {
        case 'getGoesDcp':
            return await getGoesDcp(event.arguments)
        case 'getGoesDcps':
            return await getGoesDcps(event.arguments)

        case 'getGrbs':
            return await getGrbs(event.arguments)
        case 'getGrb':
            return await getGrb(event.arguments)

        case 'newGrb':
            return await newGrb(event.arguments)
        case 'newDcp':
            return await newDcp(event.arguments)

        default:
            throw new Error('Unknown field, unable to resolve ' + event.field)
    }
};