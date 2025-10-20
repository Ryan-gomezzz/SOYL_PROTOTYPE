import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

export class SoylStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'SoylDesigns', {
      tableName: 'SOYL-Designs',
      partitionKey: { name: 'designId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    const bucket = new s3.Bucket(this, 'SoylAssets', {
      bucketName: props?.env?.region ? `soyl-assets-${props.env.region}` : 'soyl-assets',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
    });

    const handler = new lambdaNode.NodejsFunction(this, 'SoylHandler', {
      entry: path.join(__dirname, '..', 'handler.js'), // point to compiled JS
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      environment: {
        DDB_TABLE: table.tableName,
        S3_BUCKET: bucket.bucketName,
        // LLM_ENDPOINT left to env config after deploy
      }
    });

    // Grant least-privilege
    table.grantReadWriteData(handler);
    bucket.grantPut(handler);
    bucket.grantRead(handler);

    // allow read to specific Secrets (configured in IAM policy below)
    handler.addToRolePolicy(new iam.PolicyStatement({
      actions: ['secretsmanager:GetSecretValue'],
      resources: [`arn:aws:secretsmanager:${this.region}:${this.account}:secret:SOYL/*`]
    }));

    // API Gateway
    const api = new apigw.LambdaRestApi(this, 'SoylApi', {
      handler,
      proxy: false,
      restApiName: 'SOYL API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS
      }
    });

    const designs = api.root.addResource('designs');
    designs.addMethod('POST', new apigw.LambdaIntegration(handler));

    const health = api.root.addResource('health');
    health.addMethod('GET', new apigw.LambdaIntegration(handler));
    
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
    new cdk.CfnOutput(this, 'LambdaName', { value: handler.functionName });
    new cdk.CfnOutput(this, 'DynamoTable', { value: table.tableName });
    new cdk.CfnOutput(this, 'S3Bucket', { value: bucket.bucketName });
  }
}
