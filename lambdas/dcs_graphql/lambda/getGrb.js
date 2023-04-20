//
// getGrb
//
// Search ElasticSearch for a particular GRB NetCDF Product by CID
//
const { assert } = require('console')
const { SearchIndex, QueryGeoXOIndex } = require('./es.js')

const SEARCH_GRB_CIDS_INDEX = process.env.SEARCH_GRB_CIDS_INDEX
const SEARCH_GRB_INDEX = process.env.SEARCH_GRB_INDEX

assert(SEARCH_GRB_CIDS_INDEX, "SEARCH_GRB_CIDS_INDEX")
assert(SEARCH_GRB_INDEX, "SEARCH_GRB_INDEX")

// Search for a particular GRB NetCDF by CID
const getGrb = async (args) => {
    const cid = args.cid
    if (!cid) {
        console.error("Invalid null cid!")
        return null
    }

    console.log(`getGrb cid: ${cid}`)
    const searchQuery = { cid }
    const userFields = ['all']
    const limit = 1
    let result
    const results = await QueryGeoXOIndex(SEARCH_GRB_INDEX, searchQuery, userFields, limit)
    if (results) {
        result = results[0]
        result.stores = await SearchIndex(SEARCH_GRB_CIDS_INDEX, cid)
    }

    console.log('result', JSON.stringify(result, 2))
    return result
}

module.exports.getGrb = getGrb
