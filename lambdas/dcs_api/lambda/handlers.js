//
// Handlers
//
// Pat Cappelaere, IBM Consulting
//

const { SearchCid, QueryDcs, SQLQuery } = require('./es.js')
const { R2PresignedUrl, S3PresignedUrl } = require('./s3.js')
const { CloudFrontPresignedUrl } = require("./cloudfront.js")

const { BuildSQLQueryDcs } = require('./openaisql.js')

const SEARCH_DCS_GOES_INDEX = 'search-dcs-goes'
const SEARCH_DCS_IRIDIUM_INDEX = 'search-dcs-iridium'
const SEARCH_DCS_DECODED_INDEX = 'search-dcs-decoded'

const FormatData = (json) => {
  let buff = Buffer.from(json.BinaryMsg, 'base64');
  json.RawData = buff.toString('ascii');
  return json
}

const GetCid = async (params, query, body, identity, agent) => {
  console.log('GetCid')
  const cid = params.cid
  let json = await SearchCid(cid)
  if (json.ok && (json.ok === false)) return {}
  if (json.length == 0) {
    throw new Error(`CID not found ${cid}`)
  }

  // default r2 storage
  if (!query) {
    query = { class: 'r2' }
  }

  if (query && query.class) {
    let cls = query.class
    if (cls === 'cf') cls = 's3'
    json = json.filter((r) => {
      return (r.class === cls)
    })
    json = json[0]
    switch (query.class) {
      case 'r2':
        json.url = await R2PresignedUrl(json.bucket, json.key)
        break
      case 's3':
        json.url = await S3PresignedUrl(json.bucket, json.key)
        break
      case 'cf':
        json.url = await CloudFrontPresignedUrl(json.bucket, json.key)
        break
      default:
        console.log(`No presigned url for that storage class ${query.class}`)
        break
    }
  }
  return json
}

const DownloadCid = async (params, query, body, identity, agent) => {
  console.log('DownloadCid NOT IMPLEMENTED')
  return {}
}

const GetCidMeta = async (params, query, body, identity, agent) => {
  console.log('GetCidMeta')
  const cid = params.cid
  const arr = await SearchCid(cid)
  // Find the s3 entry and add cf
  const els = arr.filter((el) => { return (el.class == 's3') })
  const cf = Object.assign({}, els[0])
  cf.class = 'cf'
  arr.push(cf)
  return arr
}

//   body: '{"query":{"sat":"goes","platformId":"4565D704"},"fields":["cid","agency"],"limit":"10"}',
const SearchDcs = async (params, query, body, identity, agent) => {
  console.log('SearchDCs')
  const searchQuery = body.query
  const userFields = body.fields || ['all']
  const limit = parseInt(body.limit) || 10
  const sat = searchQuery.sat || 'goes'

  let index, timefield

  if (sat === 'goes') {
    index = SEARCH_DCS_GOES_INDEX
    timefield = 'LocalRecvTime'
  } else if (sat === 'iridium') {
    index = SEARCH_DCS_IRIDIUM_INDEX
    timefield = 'LocalRecvTime'
  } else if (sat === 'decode') {
    index = SEARCH_DCS_DECODED_INDEX
    timefield = 'timestamp'
  } else {
    throw new Error(`Invalid sat ${sat}`)
  }
  const result = await QueryDcs(index, searchQuery, userFields, limit, timefield)
  return result.map((j) => FormatData(j))
}

const Login = async (params, query, body, identity, agent) => {
  console.log('Login')
  return {}
}

const Logout = async (params, query, body, identity, agent) => {
  console.log('Logout')
  return {}
}

const SQLSearchDcs = async (params, query, body, identity, agent) => {
  console.log('SQLSearchDcs')

  const sql = await BuildSQLQueryDcs(body.query)
  let results = await SQLQuery(sql)
  results = results.map((j) => FormatData(j))

  return {
    sql,
    results
  }
}

module.exports.GetCid = GetCid
module.exports.DownloadCid = DownloadCid
module.exports.GetCidMeta = GetCidMeta
module.exports.SearchDcs = SearchDcs
module.exports.SQLSearchDcs = SQLSearchDcs

module.exports.Login = Login
module.exports.Logout = Logout

