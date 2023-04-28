import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as s3, aws_s3_deployment as s3Deployment } from 'aws-cdk-lib';
import { BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import { CfnDistribution, CloudFrontWebDistribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';

export class IacStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const deploymentBucket = new s3.Bucket(this, 'deployment-bucket', {
      publicReadAccess: true,
      websiteIndexDocument: "index.html",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: new BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false
      })
    });

    const deployment = new s3Deployment.BucketDeployment(this, 'deployStaticWebsite', {
      sources: [s3Deployment.Source.asset("../frontend/dist")],
      destinationBucket: deploymentBucket
    });

    // Define CloudFront Distribution with error responses.
    const accessDeniedErrorResponse: CfnDistribution.CustomErrorResponseProperty = {
      errorCode: 403,
      errorCachingMinTtl: 30,
      responseCode: 200,
      responsePagePath: '/index.html',
    };
    const notFoundErrorResponse: CfnDistribution.CustomErrorResponseProperty = {
      errorCode: 404,
      errorCachingMinTtl: 30,
      responseCode: 200,
      responsePagePath: '/index.html',
    };

    const oai = new OriginAccessIdentity(this, 'bucket-oai', {});
    deploymentBucket.grantRead(oai);
    
    const distribution = new CloudFrontWebDistribution(this, 'cf-web-distribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: deploymentBucket,
            originAccessIdentity: oai
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
      errorConfigurations: [
        accessDeniedErrorResponse,
        notFoundErrorResponse
      ]
    });
  }
}
