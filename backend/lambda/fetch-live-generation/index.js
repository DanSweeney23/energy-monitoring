const https = require("https");
const AWS = require('aws-sdk')
const xml2js = require('xml2js');

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

  const parsedResponse = await parser.parseString(elexonResponse);

  console.log(parsedResponse);
}