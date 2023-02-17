const config = require('./config.json')
const crypto = require('crypto')
const jose = require('jose')
const buffer = require('buffer');

const jwtVerifier1 = async (jwt) => {
    try {
        const secret = config.secret
        const secretKey = secret && crypto.createSecretKey(buffer.Buffer.from(secret))
        return await jose.jwtVerify(jwt, secretKey);
    } catch (err) {
        console.error(`JWT Verification Error ${err}`)
        return null
    }
}
const jwtVerifier2 = async (jwt) => {
    try {
        const secret = config.client_secret
        const secretKey = secret && crypto.createSecretKey(buffer.Buffer.from(secret))
        return await jose.jwtVerify(jwt, secretKey);
    } catch (err) {
        console.error(`JWT Verification Error ${err}`)
        return null
    }
}
const jwtVerifier3 = async (jwt) => {
    try {
        const secret = config.app_client_secret
        const secretKey = secret && crypto.createSecretKey(buffer.Buffer.from(secret))
        return await jose.jwtVerify(jwt, secretKey);
    } catch (err) {
        console.error(`JWT Verification Error ${err}`)
        return null
    }
}
module.exports.jwtVerifier1 = jwtVerifier1
module.exports.jwtVerifier2 = jwtVerifier2
module.exports.jwtVerifier3 = jwtVerifier3