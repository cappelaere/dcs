'use strict'

const { Client } = require('@elastic/elasticsearch')
const { assert } = require('console')

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

const SEARCH_CIDS_INDEX = 'search-dcs-cids'
// const SEARCH_DCS_GOES_INDEX = 'search-dcs-goes'
// const SEARCH_DCS_IRIDIUM_INDEX = 'search-dcs-iridium'

const SearchIndex = async (index, cid) => {
  console.log(`SearchIndex ${index}, ${cid}`)
  try {
    const result = await esClient.search({
      index,
      query: {
        match: { cid }
      }
    })
    // const results = result.hits.hits.map((r) => r._source)
    const results = result.hits.hits.map((r) => {
      const id = r._id
      const result = r._source
      result.id = id
      return result
    })

    // console.log(results)
    return results
  } catch (err) {
    console.error(`SearchIndex error ${err.message}`)
    return err
  }
}

const SearchCid = async (cid) => {
  return await SearchIndex(SEARCH_CIDS_INDEX, cid)
}

const FormatQuery = (query, timefield, from, to) => {
  const keys = Object.keys(query)

  if (keys.length === 1) {
    const match = {}
    match[keys[0]] = query[keys[0]]
    return { match }
  }

  const res = keys.map((key) => {
    const match = {}
    match[key] = query[key]
    return { match }
  })

  const finalQuery = {
    bool: { must: res }
  }

  const timefields = {}
  let range

  if (from) {
    timefields["gte"] = from
  }
  if (to) {
    timefields["lte"] = to
  }

  if (timefield && (timefields.length > 0)) {
    range = {}
    range[timefield] = timefields
    finalQuery.bool.must.push({ range })
  }

  console.log(JSON.stringify(finalQuery, null, '\t'))
  return finalQuery
}

const QueryIndex = async (index, query) => {
  try {
    const result = await esClient.search({
      index,
      query
    })
    const results = result.hits.hits.map((r) => r._source)
    return results
  } catch (err) {
    console.error(err)
    return null
  }
}

const SQLQuery = async (sqlQuery) => {
  try {
    const result = await esClient.sql.query({
      query: sqlQuery
    })
    // console.log(result)

    const data = result.rows.map(row => {
      const obj = {}
      for (let i = 0; i < row.length; i++) {
        obj[result.columns[i].name] = row[i]
      }
      return obj
    })

    return data
  } catch (error) {
    console.error(error.meta.body)
    return error.meta.body
  }
}

//
// Query GOES or IRIDIUM DCS Indices
//
const QueryGeoXOIndex = async (index, query, userFields, userLimit, timefield, from, to) => {
  const fields = userFields || ['cid']
  const formattedQuery = FormatQuery(query, timefield, from, to)
  const limit = parseInt(userLimit)

  console.log(`QueryGeoXOIndex: ${index}, ${JSON.stringify(formattedQuery)}, ${fields}, ${limit}`)

  const results = await QueryIndex(index, formattedQuery)
  console.log(results)
  const res = results.map((r) => {
    if (fields.length === 1) {
      if (fields[0] === 'all') {
        return r
      } else {
        return r[fields[0]]
      }
    }

    // remove extra fields
    const keys = Object.keys(r)
    for (const k of keys) {
      if (!fields.includes(k)) {
        // console.log(`deleting ${k} ${fields}`)
        delete r[k]
      }
    }
    return r
  })

  if (limit < res.length) {
    return res.slice(0, limit)
  } else {
    return res
  }
}

const QueryDcs = async (index, query, userFields, userLimit, from, to) => {
  const timefield = 'LocalRecvTime'
  return await QueryGeoXOIndex(index, query, userFields, userLimit, timefield, from, to)
}

module.exports.SearchCid = SearchCid
module.exports.QueryDcs = QueryDcs
module.exports.SearchIndex = SearchIndex
module.exports.QueryGeoXOIndex = QueryGeoXOIndex
module.exports.SQLQuery = SQLQuery
