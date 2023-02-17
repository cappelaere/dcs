//
// Handlers
//
// Pat Cappelaere, IBM Consulting
//

const { SearchCid, QueryDcs } = require('./es.js')
const { R2PresignedUrl, S3PresignedUrl } = require('./s3.js')

const SEARCH_DCS_GOES_INDEX = 'search-dcs-goes'
const SEARCH_DCS_IRIDIUM_INDEX = 'search-dcs-iridium'

const GetCid = async (params, query, body, identity, agent) => {
  console.log('GetCid')
  const cid = params.cid
  let json = await SearchCid(cid)
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

const DownloadCid = async (params, query, body, identity, agent) => {
  console.log('DownloadCid NOT IMPLEMENTED')
  return {}
}

const GetCidMeta = async (params, query, body, identity, agent) => {
  console.log('GetCidMeta')
  const cid = params.cid
  const json = await SearchCid(cid)
  return json
}

//   body: '{"query":{"sat":"goes","platformId":"4565D704"},"fields":["cid","agency"],"limit":"10"}',
const SearchDcs = async (params, query, body, identity, agent) => {
  console.log('SearchDCs')
  const searchQuery = body.query
  const userFields = body.fields || ['cid']
  const limit = parseInt(body.limit) || 10
  const sat = searchQuery.sat || 'goes'

  let index

  if (sat === 'goes') {
    index = SEARCH_DCS_GOES_INDEX
  } else if (sat === 'iridium') {
    index = SEARCH_DCS_IRIDIUM_INDEX
  } else {
    throw new Error(`Invalid sat ${sat}`)
  }

  return await QueryDcs(index, searchQuery, userFields, limit)
}

const Login = async (params, query, body, identity, agent) => {
  console.log('Login')
  return {}
}

const Logout = async (params, query, body, identity, agent) => {
  console.log('Logout')
  return {}
}

module.exports.GetCid = GetCid
module.exports.DownloadCid = DownloadCid
module.exports.GetCidMeta = GetCidMeta
module.exports.SearchDcs = SearchDcs
module.exports.Login = Login
module.exports.Logout = Logout
