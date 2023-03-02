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

const SEARCH_CIDS = process.env.ES_SEARCH_CIDS
const SEARCH_INDEX = process.env.ES_SEARCH_INDEX
assert(SEARCH_CIDS, 'Undefined env SEARCH_CIDS')
assert(SEARCH_INDEX, 'Undefined env ES_SEARCH_INDEX')

const IndexDocument = async (index, document) => {
  try {
    await esClient.index({
      index,
      document
    })
    // console.log(result)
  } catch (err) {
    console.error(err)
  }
}

const IndexCid = async (document) => {
  const result = await IndexDocument(SEARCH_CIDS, document, null)
  return result
}

const IndexEvent = async (document) => {
  return await IndexDocument(SEARCH_INDEX, document)
}

module.exports.IndexDocument = IndexDocument
module.exports.IndexEvent = IndexEvent
module.exports.IndexCid = IndexCid
