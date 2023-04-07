
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer")
const moment = require('moment')
const assert = require('assert')

const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager")

const cloudfrontDistributionDomains = {
  "dcsprototype": process.env.CLOUDFRONT_DOMAIN_DCS,
  "grbprototype": process.env.CLOUDFRONT_DOMAIN_GRB
}

// const cloudfrontDistributionDomain = process.env.CLOUDFRONT_DOMAIN   // "https://ddh6z87uol079.cloudfront.net"

const keyPairId = process.env.CLOUDFRONT_KEYPAIR   // "KT081R6AK2PIX";
const SecretId = process.env.CLOUDFRONT_PEM_SECRET   // "geoxo_cloudfront_key";
const region = process.env.AWS_REGION || 'us-east-1'

assert(process.env.CLOUDFRONT_DOMAIN_DCS, 'Missing CLOUDFRONT_DOMAIN_DCS env')
assert(process.env.CLOUDFRONT_DOMAIN_GRB, 'Missing CLOUDFRONT_DOMAIN_GRB env')

assert(keyPairId, 'Missing CLOUDFRONT_KEYPAIR env')
assert(SecretId, 'Missing CLOUDFRONT_PEM_SECRET env')

const secretManagerclient = new SecretsManagerClient({ region })

async function CloudFrontPresignedUrl(bucket, key) {
  const expirationDate = moment().add(15, 'minutes')
  const dateLessThan = expirationDate.format()
  const cloudfrontDistributionDomain = cloudfrontDistributionDomains[bucket]

  const url = `${cloudfrontDistributionDomain}/${key}`;
  const privateKey = await GetPrivateKey()

  const signedUrl = getSignedUrl({
    url,
    keyPairId,
    dateLessThan,
    privateKey,
  });
  return signedUrl
}

const GetPrivateKey = async () => {
  const command = new GetSecretValueCommand({ SecretId });
  const response = await secretManagerclient.send(command);
  const secret = response.SecretString.replaceAll('\n', '\\n')
  const key = JSON.parse(secret)
  // console.log(`key ${key.key}`)
  return key.key
}

// const test = async () => {
//   const bucket = "dcsprototype"
//   const key = "dcs/goes/2023/073/CE44B7BA/dcs_goes_CE44B7BA_20230314042215.br"


//   const result = await CloudFrontPresignedUrl(bucket, key)
//   console.log(result)
// }
// test()

module.exports.CloudFrontPresignedUrl = CloudFrontPresignedUrl