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

  //Dynamo table 
  const generationTable = new dynamodb.Table(scope, 'energy-generation', {
    partitionKey: { name: 'date', type: dynamodb.AttributeType.NUMBER },
    sortKey: { name: 'time', type: dynamodb.AttributeType.NUMBER }
  });

  //Put live generation lambda 
  const putLiveGenerationLambda = newLambda('put-live-generation', Duration.seconds(10));
  putLiveGenerationLambda.addEnvironment("GENERATION_TABLE_NAME", generationTable.tableName);

  const getElexonKeyPolicy = new iam.PolicyStatement({
    actions: ['ssm:GetParameter'],
    resources: [`arn:aws:ssm:*:*:parameter/elexon/apikey`],
  });

  const writeToGenerationTablePolicy = new iam.PolicyStatement({
    actions: ['dynamodb:PutItem'],
    resources: [generationTable.tableArn]
  });


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

  //Api gateway & get live generation lambda
  const getLiveGenerationLambda = newLambda('get-live-generation');
  getLiveGenerationLambda.addEnvironment("GENERATION_TABLE_NAME", generationTable.tableName);

  const readFromGenerationTablePolicy = new iam.PolicyStatement({
    actions: ['dynamodb:Query'],
    resources: [generationTable.tableArn]
  });

  getLiveGenerationLambda.addToRolePolicy(readFromGenerationTablePolicy);

  const api = new RestApi(scope, 'data-api');
  const lambdaIntegration = new LambdaIntegration(getLiveGenerationLambda);
  api.root.addMethod('GET', lambdaIntegration);
}
