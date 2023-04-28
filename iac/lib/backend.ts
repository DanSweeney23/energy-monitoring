import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_lambda as lambda, aws_iam as iam, Duration } from 'aws-cdk-lib';


export function createBackendResources(scope: Construct) {

  const newLambda = (id: string, timeout: Duration = Duration.seconds(3)) => new lambda.Function(scope, id, {
    code: lambda.Code.fromAsset(`../backend/lambda/${id}`),
    handler: 'index.handler',
    runtime: lambda.Runtime.NODEJS_16_X,
    timeout
  });

  const fetchLiveGenerationLambda = newLambda('fetch-live-generation', Duration.seconds(10));

  const fetchElexonKeyPolicy = new iam.PolicyStatement({
    actions: ['ssm:GetParameter'],
    resources: ['arn:aws:ssm:*:*:parameter/elexon/apikey'],
  });

  fetchLiveGenerationLambda.addToRolePolicy(fetchElexonKeyPolicy);
}
