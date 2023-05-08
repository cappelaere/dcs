const msg = {
    "DomsatSeq": 31386,
    "DomsatTime": 0,
    "CarrierStart": "2023-03-17T01:03:00+00:00",
    "CarrierStop": "2023-03-17T01:03:03+00:00",
    "Baud": 300,
    "GoodPhasePct": 100,
    "FreqOffset": -2.7,
    "SignalStrength": 39.3,
    "PhaseNoise": 2.37,
    "LocalRecvTime": "2023-03-17T01:04:32+00:00",
    "BinaryMsg": "MzNBMEUxMUMyMzExNzE3MjkwNkczNi0wTk4wNjlFVVAwMDA4OSJQODQxOTg3MDFBbno/P0BAWDBabFE4QVh+QExAI0FZYjRBbTVBZzZiei03QE5BOUxYPUJJPEJLMkBtUEBGQCJAbG88QkogbFRRWlZCdEJ7Qn1DRkNIQ0wg",
    "flags": "0x00081855",
    "platformId": "33A0747E",
    "sat": "goes",
    "cid": "bafkreiffmt6aqq4pr432x5jhjfoa2i2qwwzhsjkywfoswpw3vmgupjylke"
}

let buff = Buffer.from(msg.BinaryMsg, 'base64');
msg.RawData = buff.toString('ascii');
console.log(msg)

