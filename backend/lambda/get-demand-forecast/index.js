const AWS = require('aws-sdk')

exports.handler = async function () {
  const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
  const ssmClient = new AWS.SSM({
    apiVersion: '2014-11-06',
  });

  const latestForecastParam = await ssmClient.getParameter({
    Name: '/demandforecast/latest',
  }).promise();
  const fileKey = latestForecastParam.Parameter.Value;

  const latestForecast = await s3.getObject({
    Bucket: process.env.DATA_BUCKET_NAME,
    Key: fileKey
  }).promise();

  return latestForecast;
}