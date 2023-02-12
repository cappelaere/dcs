//
// DCS Interface for the GeoXO CLI support
//

const { GetCid, DownloadCid, GetCidMeta, SearchDcs, Login, Logout } = require('./handlers.js')

const handlers = {
  GetCid,
  DownloadCid,
  GetCidMeta,
  SearchDcs,
  Login,
  Logout
}

// Handler
exports.handler = async function (event, context) {
  // console.log('## PGC2 ENVIRONMENT VARIABLES: ' + serialize(process.env))
  // console.log('## PGC2 CONTEXT: ' + serialize(context))
  // console.log('## PGC2 EVENT: ' + serialize(event))

  const query = event.queryStringParameters
  const params = event.pathParameters
  const operation = event.requestContext.operationName
  const identity = event.requestContext.identity
  const agent = identity.userAgent
  let body = event.body

  try {
    if (body) {
      console.log(`body: ${body}`)
      body = JSON.parse(body)
    }
    const customHandler = handlers[operation]
    if (customHandler) {
      return customHandler(params, query, body, identity, agent)
    } else {
      const error = {
        code: 500,
        message: `Invalid operation ${operation}`
      }
      return formatError(error)
    }
  } catch (error) {
    return formatError(error)
  }
}

// const formatResponse = (body) => {
//   const response = {
//     statusCode: 200,
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     isBase64Encoded: false,
//     body
//   }
//   return response
// }

const formatError = (error) => {
  const response = {
    statusCode: error.statusCode,
    headers: {
      'Content-Type': 'text/plain',
      'x-amzn-ErrorType': error.code
    },
    isBase64Encoded: false,
    body: error.code + ': ' + error.message
  }
  return response
}

// const serialize = (object) => {
//   return JSON.stringify(object, null, 2)
// }
