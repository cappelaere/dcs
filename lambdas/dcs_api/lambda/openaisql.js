//
// OpenAI Interface to allow a user to enter free form queries and get a SQL query back
//
// Pat Cappelaere. IBM Consulting
//

'use-strict'

const { Configuration, OpenAIApi } = require("openai")
const { assert } = require('console')
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
assert(OPENAI_API_KEY, 'undefined env OPENAI_API_KEY')

//
// Call OpenAPI to get resulting SQL query to send to ElasticSearch
//
const BuildSQLQueryGRB = async (query) => {
    const configuration = new Configuration({
        apiKey: OPENAI_API_KEY,
    })
    const openai = new OpenAIApi(configuration)

    try {
        // const prompt = "### Postgres SQL tables, with their properties:\n#\n# Employee(id, name, department_id)\n# Department(id, name, address)\n# Salary_Payments(id, employee_id, amount, date)\n#\n### A query to list the names of the departments which employed more than 10 employees in the last 3 months\nSELECT"
        let prompt = `### DSN Mappings:
# Text: ABI Radiance Mesoscale Sector 1
# dsn: ABI-L1b-RadM1
# Text: ABI Radiance Mesoscale Sector 2
# dsn: ABI-L1b-RadM2
# Text: ABI Radiance CONUS
# dsn: ABI-L1b-RadC
# Text: ABI Radiance Full Disc
# dsn: ABI-L1b-RadF
# Text: RadM1
# dsn: ABI-L1b-RadM1
# Text: RadM2
# dsn: ABI-L1b-RadM2
# Text: RadC
# dsn: ABI-L1b-RadC
# Text: RadF
# dsn: ABI-L1b-RadF
# Text: SFEU
# dsn: EXIS-L1b-SFEU
# Text: SFXR
# dsn: EXIS-L1b-SFXR
# Text: GEOF
# dsn: MAG-L1b-GEOF
# Text: EHIS
# dsn: SEIS-L1b-EHIS
# Text: MPSL
# dsn: SEIS-L1b-MPSL
# Text: SGPS
# dsn: SEIS-L1b-SGPS
# Text: Fe093
# dsn: SUVI-L1b-Fe093
# Text: Fe131
# dsn: SUVI-L1b-Fe131
# Text: Fe171
# dsn: SUVI-L1b-Fe171
# Text: Fe195
# dsn: SUVI-L1b-Fe195
# Text: Fe284
# dsn: SUVI-L1b-Fe284
# Text: He303
# dsn: SUVI-L1b-He303
### SQL table, with their properties:
#
# search-grb-index(cid, fileName, satellite, level, instrument, dsn, mode, eventTime, storageDelay, insertDelay)
#
### A query to ${query}
SELECT`

        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt,
            temperature: 0,
            max_tokens: 150,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            stop: ['#', ';']
        });

        const result = `SELECT ${completion.data.choices[0].text}`;
        return FixQuery(result)
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
    }
}

//
// Call OpenAPI to get resulting SQL query to send to ElasticSearch
//
const BuildSQLQueryDcs = async (query) => {
    const configuration = new Configuration({
        apiKey: OPENAI_API_KEY,
    })
    const openai = new OpenAIApi(configuration)

    try {
        // const prompt = "### Postgres SQL tables, with their properties:\n#\n# Employee(id, name, department_id)\n# Department(id, name, address)\n# Salary_Payments(id, employee_id, amount, date)\n#\n### A query to list the names of the departments which employed more than 10 employees in the last 3 months\nSELECT"
        let prompt = `### Mappings:
#
### SQL table, with their properties:
#
# search-dcs-goes(cid, sat, platformid, LocalRecvTime, flags, msg)
# search-dcs-iridium(cid, sat, platformId, LocalRecvTime, flags, msg)
# 
#
### A query to ${query}
SELECT`

        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt,
            temperature: 0,
            max_tokens: 150,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            stop: ['#', ';']
        });

        const result = `SELECT ${completion.data.choices[0].text}`;
        return FixQuery(result)
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
    }
}

const FixInterval = (query) => {
    if (query.indexOf('interval') > 0) {
        const interval = query.indexOf('interval')
        console.log(interval)
        const arr1 = query.slice(0, interval)
        const arr2 = query.slice(interval, query.length)

        query = `${arr1}${arr2.replaceAll('\'', '')}`
    }
    return query
}

const FixDateSub = (query) => {
    if (query.indexOf('DATE_SUB') > 0) {
        var regExp = /\(([^)]+)\)/;
        query = query.replace('NOW()', 'NOW')
        var matches = regExp.exec(query);

        const arr = query.split(matches[0])
        arr[0] = arr[0].replace('DATE_SUB', '')

        let attr = matches[1].replace(',', '-').replace('NOW', 'NOW()')
        // console.log(arr)

        query = `${arr[0]} (${attr}) ${arr[1]}`
    }
    return query
}

const FixIndex = (query) => {
    query = query.replace('search-dcs-goes', '\"search-dcs-goes\"')
    query = query.replace('search-dcs-iridium', '\"search-dcs-iridium\"')
    return query
}

const FixQuery = (sqlQuery) => {
    console.log(`Before: ${sqlQuery}`)
    sqlQuery = FixIndex(sqlQuery)
    sqlQuery = FixInterval(sqlQuery)
    sqlQuery = FixDateSub(sqlQuery)
    console.log(`After: ${sqlQuery}`)
    return sqlQuery
}

module.exports.BuildSQLQueryGRB = BuildSQLQueryGRB
module.exports.BuildSQLQueryDcs = BuildSQLQueryDcs

