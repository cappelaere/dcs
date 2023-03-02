const { BuildSQLQueryGRB } = require("./openaisql.js")
const { SQLQuery } = require('./es.js')


const test = async () => {
  try {
    const query = 'list last five cid,dsn,satellite,mode where dsn is RadM1 for one minute'
    let sqlQuery = await BuildSQLQueryGRB(query)

    const result = await SQLQuery(sqlQuery)

    console.log(result)
  } catch (error) {
    console.error('Error', error)
  }
}

const test2 = () => {
  let q = `FROM \"search-grb-index\" \
WHERE dsn = 'ABI-L1b-RadM1' AND eventTime > DATE_SUB(NOW(), INTERVAL 1 MINUTE) \
ORDER BY eventTime DESC LIMIT 5`
  var regExp = /\(([^)]+)\)/;
  q = q.replace('NOW()', 'NOW')
  console.log(q)
  var matches = regExp.exec(q);


  //matches[1] contains the value between the parentheses
  console.log(matches);

  const arr = q.split(matches[0])
  arr[0] = arr[0].replace('DATE_SUB', '')

  let attr = matches[1].replace(',', '-').replace('NOW', 'NOW()')
  console.log(arr)

  const query = `${arr[0]} (${attr}) ${arr[1]}`
  console.log(query)
}
test()