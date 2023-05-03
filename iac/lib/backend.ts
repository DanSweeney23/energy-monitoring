import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { aws_lambda as lambda, aws_iam as iam, Duration, aws_dynamodb as dynamodb, aws_events as events, aws_events_targets as events_targets, aws_apigateway as apigateway } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';


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

  //Demand forecast dynamo table
  const forecastTable = new dynamodb.Table(scope, 'demand-forecast', {
    partitionKey: { name: 'datetime', type: dynamodb.AttributeType.NUMBER },
  });

  const writeToForecastTablePolicy = new iam.PolicyStatement({
    actions: ['dynamodb:PutItem'],
    resources: [forecastTable.tableArn]
  });

  const readFromForecastTablePolicy = new iam.PolicyStatement({
    actions: ['dynamodb:Query'],
    resources: [forecastTable.tableArn]
  });

  const putForecastLambda = newLambda('put-demand-forecast', Duration.seconds(10));
  putForecastLambda.addEnvironment("FORECAST_TABLE_NAME", forecastTable.tableName);

  putForecastLambda.addToRolePolicy(writeToForecastTablePolicy);

  new events.Rule(scope, 'five-minute-schedule-rule',
    {
      targets: [
        new events_targets.LambdaFunction(putForecastLambda),
      ],
      schedule: events.Schedule.rate(Duration.minutes(5)),
    }
  );
}
