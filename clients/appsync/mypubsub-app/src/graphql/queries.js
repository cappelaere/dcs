/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getGoesDcp = /* GraphQL */ `
  query GetGoesDcp($cid: String) {
    getGoesDcp(cid: $cid) {
      Baud
      BinaryMsg
      CarrierStart
      CarrierStop
      DomsatSeq
      DomsatTime
      FreqOffset
      GoodPhasePct
      LocalRecvTime
      PhaseNoise
      SignalStrength
      agency
      cid
      flags
      platformId
      sat
    }
  }
`;
export const getGoesDcps = /* GraphQL */ `
  query GetGoesDcps(
    $agency: String
    $limit: Int
    $platformId: String
    $sat: String!
  ) {
    getGoesDcps(
      agency: $agency
      limit: $limit
      platformId: $platformId
      sat: $sat
    ) {
      Baud
      BinaryMsg
      CarrierStart
      CarrierStop
      DomsatSeq
      DomsatTime
      FreqOffset
      GoodPhasePct
      LocalRecvTime
      PhaseNoise
      SignalStrength
      agency
      cid
      flags
      platformId
      sat
    }
  }
`;
export const getGrb = /* GraphQL */ `
  query GetGrb($cid: String, $class: String) {
    getGrb(cid: $cid, class: $class) {
      cid
      creationTime
      dsn
      endTime
      eventTime
      fileName
      fileSize
      instrument
      level
      mode
      satellite
      startTime
      stores {
        account
        bucket
        cid
        class
        key
        mtime
        type
        url
      }
    }
  }
`;
export const getGrbs = /* GraphQL */ `
  query GetGrbs(
    $dsn: String
    $eventTime: AWSDateTime
    $filter: FilterGrbInput
    $instrument: String
    $level: String
    $limit: Int
    $satellite: String
  ) {
    getGrbs(
      dsn: $dsn
      eventTime: $eventTime
      filter: $filter
      instrument: $instrument
      level: $level
      limit: $limit
      satellite: $satellite
    ) {
      cid
      creationTime
      dsn
      endTime
      eventTime
      fileName
      fileSize
      instrument
      level
      mode
      satellite
      startTime
      stores {
        account
        bucket
        cid
        class
        key
        mtime
        type
        url
      }
    }
  }
`;
