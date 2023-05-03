const cheerio = require('cheerio');
const axios = require('axios');
const AWS = require('aws-sdk')

AWS.config.update({ region: 'eu-west-2' });

const ESO_PAGE_ENDPOINT = "https://data.nationalgrideso.com/demand/2-14-days-ahead-national-demand-forecast";
const LINK_SELECTOR = "tr:contains(2-14 Days Ahead Half Hourly Forecast) > td:nth-child(4) > a:nth-child(1)";

const makeDateString = (timestamp) => `${timestamp.getUTCDate().toString()}${(timestamp.getUTCMonth()+1).toString().padStart(2, '0')}${timestamp.getUTCFullYear().toString().padStart(2, '0')}`;

exports.handler = async function (event) {
  const esoPageResponse = await axios.get(ESO_PAGE_ENDPOINT);
  const $ = cheerio.load(esoPageResponse.data, null, false);
  const fileEndpoint = $(LINK_SELECTOR).attr("href")

  const csvFileResponse = await axios.get(fileEndpoint);

  const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

  await s3.putObject({
    Bucket: process.env.DATA_BUCKET_NAME,
    Key: `demandforecasts/${makeDateString(new Date())}.csv`,
    ContentType:'text/csv',
    Body: csvFileResponse.data
  }).promise();
}