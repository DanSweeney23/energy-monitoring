#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { IacStack } from '../lib/iac-stack';

const app = new cdk.App();
new IacStack(app, 'IacStack', {
  env: {
    account: '278421086553',
    region: 'eu-west-2',
  }
});