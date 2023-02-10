const { KafkaPublish } = require('kafka.js')

const PublishMessage = async (json) => {
  // console.log(`Publish msg ${topic}`)
  // topics: dcs.goes, dcs.iridium

  const topic = `dcs.${json.sat}`
  await KafkaPublish(topic, JSON.stringify(json))
}

module.exports.PublishMessage = PublishMessage
