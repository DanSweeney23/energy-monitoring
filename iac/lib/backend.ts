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
  
  //Api gateway
  const api = new RestApi(scope, 'data-api');
  const generationResource = api.root.addResource("generation");
  const demandForecastResource = api.root.addResource("demandforecast");
  const carbonIntensityResource = api.root.addResource("carbonintensity");
  const allowOrigins = ['*'];

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
    actions: ['s3:PutObject'],
    resources: [dataStorageBucket.bucketArn, `${dataStorageBucket.bucketArn}/*`]
  });

  const getFromDataBucketPolicy = new iam.PolicyStatement({
    actions: ['s3:GetObject'],
    resources: [dataStorageBucket.bucketArn, `${dataStorageBucket.bucketArn}/*`]
  });

  //Put demand forecast lambda
  const lastDemandForecastFullAccessPolicy = new iam.PolicyStatement({
    actions: ['ssm:*'],
    resources: [`arn:aws:ssm:*:*:parameter/demandforecast/latest`],
  });

  const putDemandForecastLambda = newLambda('put-demand-forecast', Duration.seconds(20));
  putDemandForecastLambda.addEnvironment("DATA_BUCKET_NAME", dataStorageBucket.bucketName);

  putDemandForecastLambda.addToRolePolicy(writeToDataBucketPolicy);
  putDemandForecastLambda.addToRolePolicy(lastDemandForecastFullAccessPolicy);

  new events.Rule(scope, 'daily-schedule-rule',
    {
      targets: [
        new events_targets.LambdaFunction(putDemandForecastLambda),
      ],
      schedule: events.Schedule.cron({
        hour: "0",
        minute: "1"
      }),
    }
  );

  //Get demand forecast lambda
  const getDemandForecastLambda = newLambda('get-demand-forecast');
  getDemandForecastLambda.addEnvironment("DATA_BUCKET_NAME", dataStorageBucket.bucketName);

  getDemandForecastLambda.addToRolePolicy(getFromDataBucketPolicy);
  getDemandForecastLambda.addToRolePolicy(lastDemandForecastFullAccessPolicy);
  
  const getDemandForecastIntegration = new LambdaIntegration(getDemandForecastLambda);
  const latestDemandForecastResource = demandForecastResource.addResource("latest");
  latestDemandForecastResource.addCorsPreflight({ allowOrigins })
  latestDemandForecastResource.addMethod('GET', getDemandForecastIntegration);


  //Put carbon intensity lambda
  const putCarbonIntensityLambda = newLambda('put-carbon-intensity', Duration.seconds(10));
  putCarbonIntensityLambda.addEnvironment("DATA_BUCKET_NAME", dataStorageBucket.bucketName);

  putCarbonIntensityLambda.addToRolePolicy(writeToDataBucketPolicy);

  new events.Rule(scope, 'half-hourly-intensity-schedule-rule',
    {
      targets: [
        new events_targets.LambdaFunction(putCarbonIntensityLambda),
      ],
      schedule: events.Schedule.rate(Duration.minutes(30)),
    }
  );

  //Get carbon intensity lambda
  const getCarbonIntensityLambda = newLambda('get-carbon-intensity');
  getCarbonIntensityLambda.addEnvironment("DATA_BUCKET_NAME", dataStorageBucket.bucketName);

  getCarbonIntensityLambda.addToRolePolicy(getFromDataBucketPolicy);
  
  const getCarbonIntensityIntegration = new LambdaIntegration(getCarbonIntensityLambda);
  const latestCarbonIntensityResource = carbonIntensityResource.addResource("latest");
  latestCarbonIntensityResource.addCorsPreflight({ allowOrigins })
  latestCarbonIntensityResource.addMethod('GET', getCarbonIntensityIntegration);
}
