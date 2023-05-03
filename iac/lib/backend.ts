import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { aws_lambda as lambda, aws_iam as iam, Duration, aws_dynamodb as dynamodb, aws_events as events, aws_events_targets as events_targets, aws_s3 as s3 } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';


export function createBackendResources(scope: Construct, props: cdk.StackProps) {

  const newLambda = (id: string, timeout: Duration = Duration.seconds(3)) => new lambda.Function(scope, id, {
    code: lambda.Code.fromAsset(`../backend/lambda/${id}`),
    handler: 'index.handler',
    runtime: lambda.Runtime.NODEJS_16_X,
    timeout
  });

  const getElexonKeyPolicy = new iam.PolicyStatement({
    actions: ['ssm:GetParameter'],
    resources: [`arn:aws:ssm:*:*:parameter/elexon/apikey`],
  });

  //Generation dynamo table 
  const generationTable = new dynamodb.Table(scope, 'energy-generation', {
    partitionKey: { name: 'date', type: dynamodb.AttributeType.NUMBER },
    sortKey: { name: 'time', type: dynamodb.AttributeType.NUMBER }
  });

  const writeToGenerationTablePolicy = new iam.PolicyStatement({
    actions: ['dynamodb:PutItem'],
    resources: [generationTable.tableArn]
  });

  const readFromGenerationTablePolicy = new iam.PolicyStatement({
    actions: ['dynamodb:Query'],
    resources: [generationTable.tableArn]
  });

  //Put live generation lambda 
  const putLiveGenerationLambda = newLambda('put-live-generation', Duration.seconds(10));
  putLiveGenerationLambda.addEnvironment("GENERATION_TABLE_NAME", generationTable.tableName);

  putLiveGenerationLambda.addToRolePolicy(getElexonKeyPolicy);
  putLiveGenerationLambda.addToRolePolicy(writeToGenerationTablePolicy);

  new events.Rule(scope, 'five-minute-schedule-rule',
    {
      targets: [
        new events_targets.LambdaFunction(putLiveGenerationLambda),
      ],
      schedule: events.Schedule.rate(Duration.minutes(5)),
    }
  );

  //Api gateway
  const api = new RestApi(scope, 'data-api');
  const generationResource = api.root.addResource("generation");
  const allowOrigins = ['*'];

  //Get live generation lambda
  const getLiveGenerationLambda = newLambda('get-live-generation');
  getLiveGenerationLambda.addEnvironment("GENERATION_TABLE_NAME", generationTable.tableName);
  getLiveGenerationLambda.addToRolePolicy(readFromGenerationTablePolicy);

  const liveGenerationIntegration = new LambdaIntegration(getLiveGenerationLambda);
  const liveGenerationResource = generationResource.addResource("live");
  liveGenerationResource.addCorsPreflight({ allowOrigins })
  liveGenerationResource.addMethod('GET', liveGenerationIntegration);

  //Get daily generation lambda
  const getDailyGenerationLambda = newLambda('get-daily-generation');
  getDailyGenerationLambda.addEnvironment("GENERATION_TABLE_NAME", generationTable.tableName);
  getDailyGenerationLambda.addToRolePolicy(readFromGenerationTablePolicy);

  const dailyGenerationIntegration = new LambdaIntegration(getDailyGenerationLambda);
  const dailyGenerationResource = generationResource.addResource("daily");
  dailyGenerationResource.addCorsPreflight({ allowOrigins })
  dailyGenerationResource.addMethod('GET', dailyGenerationIntegration);

  //Data storage bucket
  const dataStorageBucket = new s3.Bucket(scope, 'data-storage-bucket');
  
  const writeToDataBucketPolicy = new iam.PolicyStatement({
    actions: ['s3:PutObject', 's3:PutObjectAcl'],
    resources: [dataStorageBucket.bucketArn, `${dataStorageBucket.bucketArn}/*`]
  });

  const putForecastLambda = newLambda('put-demand-forecast', Duration.seconds(10));
  putForecastLambda.addEnvironment("DATA_BUCKET_NAME", dataStorageBucket.bucketName);

  putForecastLambda.addToRolePolicy(writeToDataBucketPolicy);

  new events.Rule(scope, 'daily-schedule-rule',
    {
      targets: [
        new events_targets.LambdaFunction(putForecastLambda),
      ],
      schedule: events.Schedule.cron({
        hour: "0",
        minute: "1"
      }),
    }
  );
}
