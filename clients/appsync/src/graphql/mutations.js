/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const newDcp = /* GraphQL */ `
  mutation NewDcp(
    $agency: String
    $cid: ID
    $platformId: String
    $sat: String
  ) {
    newDcp(agency: $agency, cid: $cid, platformId: $platformId, sat: $sat) {
      agency
      cid
      platformId
      sat
    }
  }
`;
export const newGrb = /* GraphQL */ `
  mutation NewGrb(
    $cid: ID
    $dsn: String
    $instrument: String
    $level: String
    $mode: String
    $satellite: String
  ) {
    newGrb(
      cid: $cid
      dsn: $dsn
      instrument: $instrument
      level: $level
      mode: $mode
      satellite: $satellite
    ) {
      cid
      dsn
      instrument
      level
      mode
      satellite
    }
  }
`;
