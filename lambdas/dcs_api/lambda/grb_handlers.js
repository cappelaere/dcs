//
// Handlers
//
// Pat Cappelaere, IBM Consulting
//

const { SearchIndex, QueryGeoXOIndex, SQLQuery } = require('./es.js')
const { R2PresignedUrl, S3PresignedUrl } = require('./s3.js')
const { BuildSQLQueryGRB } = require('./openaisql.js')

const SEARCH_GRB_CIDS = 'search-grb-cids'
const SEARCH_GRB_DOCS = 'search-grb-index'

const GetGRBCid = async (params, query, body, identity, agent) => {
  console.log('GetGRBCid')
  const cid = params.cid
  let json = await SearchIndex(SEARCH_GRB_CIDS, cid)
  if (json.ok && (json.ok === false)) return {}

  // default r2 storage
  if (!query) {
    query = { class: 'r2' }
  }

  if (query && query.class) {
    json = json.filter((r) => {
      return (r.class === query.class)
    })
    json = json[0]
    switch (query.class) {
      case 'r2':
        json.url = await R2PresignedUrl(json.bucket, json.key)
        break
      case 's3':
        json.url = await S3PresignedUrl(json.bucket, json.key)
        break
      default:
        console.log(`No presigned url for that storage class ${query.class}`)
        break
    }
  }
  return json
}

const DownloadGRBCid = async (params, query, body, identity, agent) => {
  console.log('DownloadCid NOT IMPLEMENTED')
  return {}
}

const GetGRBCidMeta = async (params, query, body, identity, agent) => {
  console.log('GetCidMeta')
  const cid = params.cid
  const json = await SearchIndex(SEARCH_GRB_CIDS, cid)
  return json
}

//   body: '{"query":{"sat":"goes","platformId":"4565D704"},"fields":["cid","agency"],"limit":"10"}',
const SearchGRB = async (params, query, body, identity, agent) => {
  console.log('SearchGRBs')
  const searchQuery = body.query
  const userFields = body.fields || ['cid']
  const limit = parseInt(body.limit) || 10
  const from = body.from
  const to = body.to
  let index = SEARCH_GRB_DOCS
  const timefield = 'timestamp'
  return await QueryGeoXOIndex(index, searchQuery, userFields, limit, timefield, from, to)
}

const SQLSearchGRB = async (params, query, body, identity, agent) => {
  console.log('SQLSearchGRB')

  const sql = await BuildSQLQueryGRB(body.query)
  const results = await SQLQuery(sql)
  return {
    sql,
    results
  }
}

module.exports.GetGRBCid = GetGRBCid
module.exports.DownloadGRBCid = DownloadGRBCid
module.exports.GetGRBCidMeta = GetGRBCidMeta
module.exports.SearchGRB = SearchGRB
module.exports.SQLSearchGRB = SQLSearchGRB

