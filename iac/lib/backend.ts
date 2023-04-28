import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { aws_lambda as lambda, aws_iam as iam, Duration, aws_dynamodb as dynamodb, aws_events as events, aws_events_targets as events_targets } from 'aws-cdk-lib';


export function createBackendResources(scope: Construct, props: cdk.StackProps) {

  const newLambda = (id: string, timeout: Duration = Duration.seconds(3)) => new lambda.Function(scope, id, {
    code: lambda.Code.fromAsset(`../backend/lambda/${id}`),
    handler: 'index.handler',
    runtime: lambda.Runtime.NODEJS_16_X,
    timeout
  });

  const generationTable = new dynamodb.Table(scope, 'generation-table', {
    partitionKey: { name: 'datetime', type: dynamodb.AttributeType.STRING }
  });

  const fetchLiveGenerationLambda = newLambda('fetch-live-generation', Duration.seconds(10));

  fetchLiveGenerationLambda.addEnvironment("GENERATION_TABLE_NAME", generationTable.tableName);

  const fetchElexonKeyPolicy = new iam.PolicyStatement({
    actions: ['ssm:GetParameter'],
    resources: [`arn:aws:ssm:${props.env?.region}:${props.env?.account}:parameter/elexon/apikey`],
  });

  const writeToGenerationTablePolicy = new iam.PolicyStatement({
    actions: ['dynamodb:PutItem'],
    resources: [generationTable.tableArn]
  });


  fetchLiveGenerationLambda.addToRolePolicy(fetchElexonKeyPolicy);
  fetchLiveGenerationLambda.addToRolePolicy(writeToGenerationTablePolicy);

  new events.Rule(scope,'five-minute-schedule-rule',
      {
        targets: [
          new events_targets.LambdaFunction(fetchLiveGenerationLambda),
        ],
        schedule: events.Schedule.rate(Duration.minutes(5)),
      }
    );
}
