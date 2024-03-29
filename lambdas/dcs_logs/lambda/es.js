'use strict'

//
// ElasticSearch Interface
//
// Pat Cappelaere, IBM Consulting
//

const { Client } = require('@elastic/elasticsearch')
const { assert } = require('console')

const ES_CLOUD_ID = process.env.ES_CLOUD_ID
const ES_USER = process.env.ES_USER
const ES_PWD = process.env.ES_PWD

assert(ES_CLOUD_ID, 'Undefined env ES_CLOUD_ID')
assert(ES_USER, 'Undefined env ES_USER')
assert(ES_PWD, 'Undefined env ES_PWD')

const options = {
  cloud: { id: ES_CLOUD_ID },
  auth: {
    username: ES_USER,
    password: ES_PWD
  }
}

const esClient = new Client(options)

// const SEARCH_CIDS_INDEX = process.env.SEARCH_CIDS_INDEX
// const SEARCH_DCS_GOES_INDEX = process.env.SEARCH_DCS_GOES_INDEX
// const SEARCH_DCS_IRIDIUM_INDEX = process.env.SEARCH_DCS_IRIDIUM_INDEX
// const SEARCH_DCS_METRICS_INDEX = process.env.SEARCH_DCS_METRICS_INDEX
const SEARCH_DCS_LOGS_INDEX = process.env.SEARCH_DCS_LOGS_INDEX

// assert(SEARCH_CIDS_INDEX)
// assert(SEARCH_DCS_GOES_INDEX)
// assert(SEARCH_DCS_IRIDIUM_INDEX)
// assert(SEARCH_DCS_METRICS_INDEX)
assert(SEARCH_DCS_LOGS_INDEX, 'Undefined env SEARCH_DCS_LOGS_INDEX')

const IndexDocument = async (index, log) => {
  try {
    await esClient.index({
      index,
      document: log
    })
    // console.log(result)
  } catch (err) {
    console.error(err)
  }
}

const IndexLogDocument = async (document) => {
  return await IndexDocument(SEARCH_DCS_LOGS_INDEX, document)
}

module.exports.IndexDocument = IndexDocument
module.exports.IndexLogDocument = IndexLogDocument
