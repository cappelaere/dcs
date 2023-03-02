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

//
// ElasticSearch SQL Query
//
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

module.exports.SQLQuery = SQLQuery
