//
// DCS Interface for the GeoXO CLI support
//

const { GetCid, DownloadCid, GetCidMeta, SearchDcs, Login, Logout } = require('./handlers.js')
const { GetGRBCid, DownloadGRBCid, GetGRBCidMeta, SearchGRB, SQLSearchGRB } = require('./grb_handlers.js')

const { jwtVerifier1, jwtVerifier2 } = require('./jwt.js')

const handlers = {
  GetCid,
  DownloadCid,
  GetCidMeta,
  SearchDcs,
  Login,
  Logout,
  GetGRBCid,
  DownloadGRBCid,
  GetGRBCidMeta,
  SearchGRB,
  SQLSearchGRB
}

// Handler
exports.handler = async function (event, context) {
  // console.log('## PGC2 ENVIRONMENT VARIABLES: ' + serialize(process.env))
  // console.log('## PGC2 CONTEXT: ' + serialize(context))
  console.log('## PGC3 EVENT: ' + serialize(event))

  const query = event.queryStringParameters
  const params = event.pathParameters
  const operation = event.requestContext.operationName
  let identity = event.requestContext.identity
  const agent = identity.userAgent
  let body = event.body

  if (event.headers && event.headers.id_token && event.headers.auth_token) {
    const id_token = event.headers.id_token
    const auth_token = event.headers.auth_token
    const user = await jwtVerifier2(id_token)
    const authToken = await jwtVerifier1(auth_token)

    identity = user.payload
    identity.permissions = authToken.payload.permissions
    if (!identity.permissions.includes('read:dcs')) {
      const error = {
        statusCode: 403,
        message: "Forbidden. No permission for attempted operation"
      }
      return formatError(error)
    }
    console.log(`Identity: ${JSON.stringify(identity)}`)
  } else {
    console.log("Could not find id_token and auth_token in headers")
    // should really return 401 - Authorized
  }

  try {
    if (body) {
      console.log(`body: ${body}`)
      body = JSON.parse(body)
    }
    const customHandler = handlers[operation]
    if (customHandler) {
      const result = await customHandler(params, query, body, identity, agent)
      return formatResponse(result)
    } else {
      const error = {
        code: 500,
        message: `Invalid operation ${operation}`
      }
      return formatError(error)
    }
  } catch (error) {
    console.error(error)
    return formatError(error)
  }
}

const formatResponse = (json) => {
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    isBase64Encoded: false,
    body: serialize(json)
  }
  return response
}

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

const serialize = (object) => {
  return JSON.stringify(object, null, 2)
}
