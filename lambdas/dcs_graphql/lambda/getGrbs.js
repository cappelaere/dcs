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
const getGrbs = async (args) => {
    let limit = args.limit
    if (limit) {
        delete args.limit
    } else {
        limit = 10
    }

    console.log(`getGrbs ${JSON.stringify(args, 2)}`)
    const userFields = ['all']
    const searchQuery = args
    const result = await QueryGeoXOIndex(SEARCH_GRB_INDEX,
        searchQuery, userFields, limit)

    // result.stores = await SearchIndex(SEARCH_GRB_CIDS_INDEX, cid)

    console.log('result', JSON.stringify(result, 2))
    return result
}

module.exports.getGrbs = getGrbs
