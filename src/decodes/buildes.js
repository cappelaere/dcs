// 
// Pat Cappelaere, IBM Consulting
//
// builds elasticsearch index for decoded data

var fs = require('fs');
const path = require('path')
const moment = require('moment')

const { Client } = require('@elastic/elasticsearch')
const { assert } = require('console')

const ES_CLOUD_ID = process.env.ES_CLOUD_ID
const ES_USER = process.env.ES_USER
const ES_PWD = process.env.ES_PWD

assert(ES_CLOUD_ID, 'Undefined env ES_CLOUD_ID')
assert(ES_USER, 'Undefined env ES_USER')
assert(ES_PWD, 'Undefined env ES_PWD')

const DCS_DECODED_INDEX = process.env.DCS_DECODED_INDEX || 'search-dcs-decoded'

const options = {
    cloud: { id: ES_CLOUD_ID },
    auth: {
        username: ES_USER,
        password: ES_PWD
    }
}

const esClient = new Client(options)

const IndexDocument = async (json) => {
    const index = DCS_DECODED_INDEX
    try {
        await esClient.index({
            index,
            document: json
        })
        // console.log(result)
    } catch (err) {
        console.error(err)
    }
}

const dir = path.join(__dirname, '87229561.json')
const files = fs.readdirSync(dir)

const RemoveEndOfTime = (str) => {
    const remove = ".000+0000"
    const pos = str.indexOf(remove)
    if (pos > 0) {
        return str.substring(0, pos)
    }
    return str
}

//
// Generate json document to index and index it in ES
//
const CreateDocument = async (fileName) => {
    console.log(`doc ${fileName}`)
    const json = JSON.parse(fs.readFileSync(fileName))
    const decodedData = json.DecodedData
    const sensors = decodedData.Sensors
    const hash = {}
    let timestamp = RemoveEndOfTime(decodedData.EndTime.toString())
    // hash.timestamp = timestamp
    hash.timestamp = moment(timestamp, 'YYYY-MM-DD HH:mm:ss').toISOString()
    hash.sat = 'decode'
    hash.platformId = json.platformId
    hash.flags = json.flags
    hash.station = decodedData.Station
    hash.agency = 'NOANOS'
    for (let s of sensors) {
        hash[s.ParameterCode] = s.Values[0]
    }
    // console.log(hash)
    await IndexDocument(hash)
}

const ParseAllFiles = async () => {
    for (let file of files) {
        await CreateDocument(path.join(dir, file))
        // console.log(json)
    }
}

ParseAllFiles()
// CreateDocument(path.join(dir, files[0]))



