const AWS = require('aws-sdk')

exports.handler = async function () {
  const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

  const fileKey = `intensity/latest.json`;

  const latestForecast = await s3.getObject({
    Bucket: process.env.DATA_BUCKET_NAME,
    Key: fileKey
  }).promise();

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "text/json"
    },
    body: latestForecast.Body.toString('utf-8')
  };

  return response;
}