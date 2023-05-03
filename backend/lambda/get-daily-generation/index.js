const AWS = require('aws-sdk');

const makeDateString = (timestamp) => `${timestamp.getUTCDate()}${(timestamp.getUTCMonth() + 1).toString().padStart(2, '0')}${timestamp.getUTCFullYear().toString().padStart(2, '0')}`;

exports.handler = async function (event) {
  const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

  const params = {
    TableName: process.env.GENERATION_TABLE_NAME,
    KeyConditionExpression: `#date = :date`,
    ExpressionAttributeValues: {
      ":date": {
        N: makeDateString(new Date()),
      }
    },
    ExpressionAttributeNames: {
      "#date": "date"
    }
  }

  const res = await ddb.query(params).promise();

  const responseBody = res.Items

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(responseBody)
  };

  return response;
}