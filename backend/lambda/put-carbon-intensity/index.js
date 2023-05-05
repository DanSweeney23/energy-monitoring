const AWS = require('aws-sdk')
const axios = require('axios');

AWS.config.update({ region: 'eu-west-2' });

const BASE_URL = 'https://api.carbonintensity.org.uk/intensity';

exports.handler = async function (event) {
  //round up to next half hour
  const endDate = new Date();
  endDate.setHours(endDate.getMinutes() > 30 ? endDate.getHours() + 1 : endDate.getHours())
  endDate.setMinutes(endDate.getMinutes() > 30 ? 0 : 30);
  endDate.setSeconds(0);
  endDate.setMilliseconds(0);

  //One week ago
  const startDate = new Date(endDate.getTime() - (60 * 60 * 24 * 7 * 1000));

  const url = `${BASE_URL}/${startDate.toISOString()}/${endDate.toISOString()}`;
  console.log(url);

  const intensityResponse = await axios.get(url);
  const intensityData = intensityResponse.data.data;

  const processedData = intensityData.map(item => ({
    time: item.from,
    intensity: item.intensity.actual ?? item.intensity.forecast //most recent couple of hours won't have actual data yet
  }));

  //Save intensity to data bucket
  const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
  const fileKey = `intensity/latest.json`;

  await s3.putObject({
    Bucket: process.env.DATA_BUCKET_NAME,
    Key: fileKey,
    ContentType:'text/json',
    Body: JSON.stringify(processedData)
  }).promise();
} 