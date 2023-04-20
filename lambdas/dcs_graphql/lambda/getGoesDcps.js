//
// getGoesDcps
//
// Search ElasticSearch for a list of DCPs
//
const assert = require('assert')

const { QueryDcs } = require('./es.js')

const SEARCH_DCS_GOES_INDEX = process.env.SEARCH_DCS_GOES_INDEX
const SEARCH_DCS_IRIDIUM_INDEX = process.env.SEARCH_DCS_IRIDIUM_INDEX

assert(SEARCH_DCS_GOES_INDEX, 'SEARCH_DCS_GOES_INDEX')
assert(SEARCH_DCS_IRIDIUM_INDEX, 'SEARCH_DCS_IRIDIUM_INDEX')

const getGoesDcps = async (args) => {
  let limit = args.limit
  if (limit) {
    delete args.limit
  } else {
    limit = 10
  }

  const sat = args.sat || 'goes'
  const userFields = ['all']

  console.log(`getGoesDcps ${sat} ${limit} ${JSON.stringify(args, 2)}`)

  let index

  if (sat === 'goes') {
    index = SEARCH_DCS_GOES_INDEX
  } else if (sat === 'iridium') {
    index = SEARCH_DCS_IRIDIUM_INDEX
  } else {
    throw new Error(`Invalid sat ${sat}`)
  }

  const searchQuery = args
  const result = await QueryDcs(index, searchQuery, userFields, limit)
  if (limit) {
    return result.slice(0, limit)
  } else {
    return result
  }
}

module.exports.getGoesDcps = getGoesDcps
