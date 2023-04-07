

const testDcs = async () => {
    let query
    //query = await BuildSQLQueryDcs('list last ten goes records where platform=335915D0 since last 20 minutes')
    //console.log(query)

    query = await BuildSQLQueryDcs('list two iridium records where platform=300234064483310 since yesterday')
    console.log(query)
}
testDcs()
