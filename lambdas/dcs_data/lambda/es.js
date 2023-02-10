'use strict'

//
// ElasticSearch Interface
//
// Pat Cappelaere, IBM Consulting
//

const { Client } = require('@elastic/elasticsearch')
const { assert } = require('assert')

const ES_CLOUD_ID = process.env.ES_CLOUD_ID
const ES_USER = process.env.ES_USER
const ES_PWD = process.env.ES_PWD

assert(ES_CLOUD_ID)
assert(ES_USER)
assert(ES_PWD)

const options = {
  cloud: { id: ES_CLOUD_ID },
  auth: {
    username: ES_USER,
    password: ES_PWD
  }
}

const esClient = new Client(options)

const SEARCH_CIDS_INDEX = process.env.SEARCH_CIDS_INDEX
const SEARCH_DCS_GOES_INDEX = process.env.SEARCH_DCS_GOES_INDEX
const SEARCH_DCS_IRIDIUM_INDEX = process.env.SEARCH_DCS_IRIDIUM_INDEX

assert(SEARCH_CIDS_INDEX)
assert(SEARCH_DCS_GOES_INDEX)
assert(SEARCH_DCS_IRIDIUM_INDEX)

const IndexDocument = async (index, document) => {
  // FOR NOW

  // try {
  //   const result = await esClient.index({
  //     index,
  //     document
  //   })
  //   console.log(result)
  // } catch (err) {
  //   console.error(err)
  // }
}

const IndexMessage = async (document) => {
  if (document.sat === 'goes') {
    return await IndexDocument(SEARCH_DCS_GOES_INDEX, document)
  } else if (document.sat === 'iridium') {
    return await IndexDocument(SEARCH_DCS_IRIDIUM_INDEX, document)
  }
}

module.exports.IndexDocument = IndexDocument
module.exports.IndexMessage = IndexMessage