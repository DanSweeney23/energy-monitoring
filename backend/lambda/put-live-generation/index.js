const AWS = require('aws-sdk')
const xml2js = require('xml2js');
const axios = require('axios');

const makeDateString = (timestamp) => `${timestamp.getUTCDate().toString().padStart(2, '0')}${(timestamp.getUTCMonth()+1).toString().padStart(2, '0')}${timestamp.getUTCFullYear().toString().padStart(2, '0')}`;
const makeTimeString = (timestamp) => `${timestamp.getUTCHours().toString().padStart(2, '0')}${timestamp.getUTCMinutes().toString().padStart(2, '0')}${timestamp.getUTCSeconds().toString().padStart(2, '0')}`;

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

  const parsedResponse = await parser.parseStringPromise(elexonResponse.data);


  const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

  const time = parsedResponse['GENERATION_BY_FUEL_TYPE_TABLE']['INST'][0]['$']['AT'].replace(' ', 'T');
  const dt = new Date(time)


  const params = {
    TableName: process.env.GENERATION_TABLE_NAME,
    Item: {
      'date': { 'N': makeDateString(dt) },
      'time': { 'N': makeTimeString(dt) },
      'fuels': {
        'L': parsedResponse['GENERATION_BY_FUEL_TYPE_TABLE']['INST'][0]['FUEL'].map(function (row) {
          const fuelType = row['$']['TYPE'];
          const value = row['$']['VAL'];
          const percent = row['$']['PCT'];

          return { 'M': { value: { 'N': value }, percent: { 'N': percent }, fuelType: { 'S': fuelType } } };
        })
      }
    }
  };

  await ddb.putItem(params).promise();
}