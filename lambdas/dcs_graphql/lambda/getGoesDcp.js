//
// getGoesDcp
//
// Search ElasticSearch for a particular DCP based on CID
//
const { SearchCid } = require('./es.js')

const getGoesDcp = async (args) => {
  const cid = args.cid
  if (!cid) {
    console.error("Invalid null cid!")
    return null
  }

  console.log(`getGoesDcp cid: ${cid}`)

  const result = await SearchCid(ci)

  console.log('result', JSON.stringify(result, 2))
  return result
}

module.exports.getGoesDcp = getGoesDcp
