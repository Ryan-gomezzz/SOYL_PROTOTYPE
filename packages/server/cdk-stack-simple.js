const cdk = require('aws-cdk-lib');
const lambda = require('aws-cdk-lib/aws-lambda');
const lambdaNode = require('aws-cdk-lib/aws-lambda-nodejs');
const apigw = require('aws-cdk-lib/aws-apigateway');
const dynamodb = require('aws-cdk-lib/aws-dynamodb');
const s3 = require('aws-cdk-lib/aws-s3');
const iam = require('aws-cdk-lib/aws-iam');
const sqs = require('aws-cdk-lib/aws-sqs');
const sources = require('aws-cdk-lib/aws-lambda-event-sources');
const wafv2 = require('aws-cdk-lib/aws-wafv2');
const cognito = require('aws-cdk-lib/aws-cognito');
const path = require('path');

class SoylStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'SoylDesigns', {
      tableName: 'SOYL-Designs',
      partitionKey: { name: 'designId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    const bucket = new s3.Bucket(this, 'SoylAssets', {
      bucketName: `soyl-assets-${this.region}`,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
    });

    // SQS queue for image jobs
    const imageQueue = new sqs.Queue(this, 'ImageQueue', {
      queueName: 'soyl-image-queue',
      visibilityTimeout: cdk.Duration.seconds(900), // Must be >= Lambda timeout
      retentionPeriod: cdk.Duration.days(4)
    });

    const handler = new lambda.Function(this, 'SoylHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler-full.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'dist'), {
        exclude: ['**', '!handler-full.js']
      }),
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        DDB_TABLE: table.tableName,
        S3_BUCKET: bucket.bucketName,
        IMAGE_QUEUE_URL: imageQueue.queueUrl
      }
    });

    // Worker Lambda for image generation
    const worker = new lambda.Function(this, 'ImageWorker', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'image-worker.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'dist'), {
        exclude: ['**', '!image-worker.js']
      }),
      memorySize: 2048,
      timeout: cdk.Duration.seconds(900),
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        DDB_TABLE: table.tableName,
        S3_BUCKET: bucket.bucketName,
        IMAGE_PROVIDER: process.env.IMAGE_PROVIDER || 'placeholder'
      }
    });

    // Grant least-privilege
    table.grantReadWriteData(handler);
    table.grantReadWriteData(worker);
    bucket.grantPut(handler);
    bucket.grantPut(worker);
    bucket.grantRead(handler);
    bucket.grantRead(worker);
    imageQueue.grantSendMessages(handler);
    worker.addEventSource(new sources.SqsEventSource(imageQueue, { batchSize: 1 }));

    // allow read to specific Secrets
    handler.addToRolePolicy(new iam.PolicyStatement({
      actions: ['secretsmanager:GetSecretValue'],
      resources: [`arn:aws:secretsmanager:${this.region}:${this.account}:secret:SOYL/*`]
    }));
    worker.addToRolePolicy(new iam.PolicyStatement({
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

        const concepts = api.root.addResource('concepts');
        const concept = concepts.addResource('{id}');
        concept.addMethod('GET', new apigw.LambdaIntegration(handler));

        const health = api.root.addResource('health');
        health.addMethod('GET', new apigw.LambdaIntegration(handler));
    
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
    new cdk.CfnOutput(this, 'LambdaName', { value: handler.functionName });
    new cdk.CfnOutput(this, 'ImageWorkerName', { value: worker.functionName });
    new cdk.CfnOutput(this, 'DynamoTable', { value: table.tableName });
    new cdk.CfnOutput(this, 'S3Bucket', { value: bucket.bucketName });
    new cdk.CfnOutput(this, 'ImageQueueUrl', { value: imageQueue.queueUrl });
  }
}

module.exports = { SoylStack };
