//
//  Pat Cappelaere, IBM Federal Consulting
//
'use_strict'

// const fs = require('fs')
const { Kafka } = require('kafkajs')
const { Partitioners } = require('kafkajs')

const { assert } = require('console')

const KAFKA_API_KEY = process.env.KAFKA_API_KEY
const KAFKA_API_SECRET = process.env.KAFKA_API_SECRET

assert(KAFKA_API_KEY, 'Undefined env KAFKA_API_KEY')
assert(KAFKA_API_SECRET, 'Undefined env KAFKA_API_SECRET')

const config = {
  clientId: 'geocloud',
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVER],
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: KAFKA_API_KEY,
    password: KAFKA_API_SECRET
  },
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
  // logLevel: logLevel.ERROR
}
const kafka = new Kafka(config)
let producer

const KafkaInit = async () => {
  producer = kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner
  })

  await producer.connect()

  console.log('Kafka inited...')
}

const KafkaPublish = async (topic, value) => {
  await producer.send({
    topic,
    messages: [{ value }]
  })
}

const KafkaDisconnect = async () => {
  await producer.disconnect()
}

module.exports.KafkaInit = KafkaInit
module.exports.KafkaPublish = KafkaPublish
module.exports.KafkaDisconnect = KafkaDisconnect
