const https = require("https");
const AWS = require('aws-sdk')
const xml2js = require('xml2js');
const axios = require('axios');
const { parse } = require("path");

exports.handler = async function (event) {
  const parser = xml2js.Parser();

  const ssmClient = new AWS.SSM({
    apiVersion: '2014-11-06',
  });

  const apiKeyParam = await ssmClient.getParameter({
    Name: '/elexon/apikey',
    WithDecryption: true,
  }).promise();
  const apiKey = apiKeyParam.Parameter.Value;

  const elexonResponse = await axios.get(`https://downloads.elexonportal.co.uk/fuel/download/latest?key=${apiKey}`);
  console.log(elexonResponse)

  const parsedResponse = await parser.parseStringPromise(elexonResponse.data);

  console.log(JSON.stringify(parsedResponse['GENERATION_BY_FUEL_TYPE_TABLE']));

  const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
  
  const time = parsedResponse['GENERATION_BY_FUEL_TYPE_TABLE']['INST'][0]['$']['AT'].replace(' ', 'T')

  const params = {
    TableName: process.env.GENERATION_TABLE_NAME,
    Item: {
      'datetime': {'S': time }, //Data format from the API is horrible
      'fuels': {'L': parsedResponse['GENERATION_BY_FUEL_TYPE_TABLE']['INST'][0]['FUEL'].map(function (row) {
        const fuelType = row['$']['TYPE'];
        const value = row['$']['VAL'];
        const percent = row['$']['PCT'];

        return { 'M': {value: {'N': value}, percent: {'N': percent}, fuelType: {'S': fuelType}}}; 
      })
      }
    }
  };

      
      console.log(JSON.stringify(params))

  await ddb.putItem(params).promise();
}