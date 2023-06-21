const fs = require('fs')
const path = require('path')
const moment = require('moment')

const dir = path.join(__dirname, '87229561.json')
const files = fs.readdirSync(dir)

const headers = ['timestamp', 'D1', 'E1', 'F1', 'L1', 'M1', 'U1', 'Y1', 'B1']

const csvFileName = path.join(__dirname, "./87229561.csv")

const RemoveEndOfTime = (str) => {
    const remove = ".000+0000"
    const pos = str.indexOf(remove)
    if (pos > 0) {
        return str.substring(0, pos)
    }
    return str
}

const CreateCSVFile = (fileName) => {
    const csvFile = fs.createWriteStream(fileName, { flags: 'w' })
    csvFile.write(headers.join(',') + "\n")
    for (let f of files) {
        const fileName = path.join(dir, f)

        const json = JSON.parse(fs.readFileSync(fileName))
        const decodedData = json.DecodedData
        const sensors = decodedData.Sensors
        const hash = {}
        let timestamp = RemoveEndOfTime(decodedData.EndTime.toString())
        hash.timestamp = timestamp

        for (let s of sensors) {
            hash[s.ParameterCode] = s.Values[0]
        }

        csvFile.write(Object.values(hash).join(',') + "\n")
    }
    csvFile.end()
    console.log(`${fileName} created`)
}

// CreateCSVFile(csvFileName)

// let EndTime = "2023-03-08 19:42:00.000+0000"
// console.log(RemoveEndOfTime(EndTime))

