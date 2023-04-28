#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { IacStack } from '../lib/iac-stack';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();

new PipelineStack(app, 'PipelineStack', {
  env: {
    account: '278421086553',
    region: 'eu-west-2',
  }
});

new IacStack(app, 'IacStack', {
  env: {
    account: '278421086553',
    region: 'eu-west-2',
  }
});