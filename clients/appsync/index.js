// top of file
const { API } = require('@aws-amplify/api')
const config = require('./aws-exports')
const { listSomething } = require('./src/graphql/queries')
const { newDcp, newGrb } = require('./src/graphql/subscriptions')

// after your imports
API.configure(config)

// // later down in your code
// async function list() {
//     const response = await API.graphql({
//         query: listSomething,
//         variables: {
//             // <your variables, optional>
//         },
//     })
//     console.log(response)
// }
// list()

async function subscribeDcp() {
    let cid, agency, sat, platformId
    const response = await API.graphql({
        query: newDcp,
        variables: {
            cid,
            agency,
            sat,
            platformId
        },
    })
    console.log(response)
}
subscribeDcp()
