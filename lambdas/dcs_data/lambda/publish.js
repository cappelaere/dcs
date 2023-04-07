const { KafkaPublish } = require('./kafka.js')

const PublishMessage = async (json) => {
  // console.log(`Publish msg ${topic}`)

  let topic = `dcs.${json.sat}`
  if (topic === 'dcs.goes') {
    if (json.agency) {
      topic += `.${json.agency}`
    }
  }

  await KafkaPublish(topic, JSON.stringify(json))
}

module.exports.PublishMessage = PublishMessage
