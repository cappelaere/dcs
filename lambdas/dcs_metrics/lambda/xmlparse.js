const { XMLValidator, XMLParser } = require('fast-xml-parser')
const { readFileSync, writeFileSync } = require('fs')

const options = {
    attributeNamePrefix: '',
    ignoreAttributes: false,
    ignoreNameSpace: false
}

const parser = new XMLParser(options)

const ValidateXML = async (xmlData) => {
    try {
        const result = await XMLValidator.validate(xmlData, {
            allowBooleanAttributes: true
        })
        return result
    } catch (err) {
        console.error(err)
        return false
    }
}

const XMLParseString = async (xml) => {
    const json = parser.parse(xml, options)
    return json
}

module.exports.XMLParseString = XMLParseString
module.exports.ValidateXML = ValidateXML