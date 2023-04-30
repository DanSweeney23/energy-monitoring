const AWS = require('aws-sdk');

const makeDateString = (timestamp) => `${timestamp.getUTCDate()}${(timestamp.getUTCMonth() + 1).toString().padStart(2, '0')}${timestamp.getUTCFullYear().toString().padStart(2, '0')}`;
const makeTimeString = (timestamp) => `${timestamp.getUTCHours().toString().padStart(2, '0')}${timestamp.getUTCMinutes().toString().padStart(2, '0')}${timestamp.getUTCSeconds().toString().padStart(2, '0')}`;

exports.handler = async function (event) {
  const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

  const maxTime = new Date();
  maxTime.setMinutes(maxTime.getMinutes() - 10);

  const params = {
    TableName: process.env.GENERATION_TABLE_NAME,
    ScanIndexForward: false,
    Limit: 1,
    KeyConditionExpression: `#date = :date AND #time > :maxtime`,
    ExpressionAttributeValues: {
      ":date": {
        N: makeDateString(maxTime),
      },
      ":maxtime": {
        N: makeTimeString(maxTime),
      }
    },
    ExpressionAttributeNames: {
      "#date": "date",
      "#time": "time"
    }
  }

  const res = await ddb.query(params).promise();

  const responseBody = res.Items[0]

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(responseBody)
  };
  console.log("response: " + JSON.stringify(response))
  return response;
}