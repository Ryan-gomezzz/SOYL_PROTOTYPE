import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sources from "aws-cdk-lib/aws-lambda-event-sources";
import * as wafv2 from "aws-cdk-lib/aws-wafv2";
import * as cognito from "aws-cdk-lib/aws-cognito";

export class SoylStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB
    const table = new dynamodb.Table(this, "SoylDesigns", {
      tableName: "SOYL-Designs",
      partitionKey: { name: "designId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // S3
    const bucket = new s3.Bucket(this, "SoylAssets", {
      bucketName: `soyl-assets-${this.region}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // SQS queue for image jobs
    const imageQueue = new sqs.Queue(this, "ImageQueue", {
      queueName: "soyl-image-queue",
      visibilityTimeout: cdk.Duration.seconds(300),
      retentionPeriod: cdk.Duration.days(4)
    });

    // Main handler (existing)
    const handler = new lambdaNode.NodejsFunction(this, "SoylHandler", {
      entry: path.join(__dirname, "..", "dist", "handler-full.js"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      tracing: lambda.Tracing.ACTIVE, // enable X-Ray
      environment: {
        DDB_TABLE: table.tableName,
        S3_BUCKET: bucket.bucketName,
        IMAGE_QUEUE_URL: imageQueue.queueUrl
      }
    });

    // Worker Lambda for image generation
    const worker = new lambdaNode.NodejsFunction(this, "ImageWorker", {
      entry: path.join(__dirname, "..", "dist", "image-worker.js"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 2048,
      timeout: cdk.Duration.seconds(900), // long-running for large images
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        DDB_TABLE: table.tableName,
        S3_BUCKET: bucket.bucketName,
        IMAGE_API_ENDPOINT: process.env.IMAGE_API_ENDPOINT || "",
        IMAGE_API_KEY_SECRET_NAME: "SOYL/IMAGE_API_KEY"
      }
    });

    // Grant permissions & event source mapping
    table.grantReadWriteData(handler);
    table.grantReadWriteData(worker);
    bucket.grantPut(handler);
    bucket.grantPut(worker);
    imageQueue.grantSendMessages(handler);
    worker.addEventSource(new sources.SqsEventSource(imageQueue, { batchSize: 1 }));

    // Secrets read permission for worker (image api key stored in Secrets Manager)
    handler.addToRolePolicy(new iam.PolicyStatement({
      actions: ["secretsmanager:GetSecretValue"],
      resources: [`arn:aws:secretsmanager:${this.region}:${this.account}:secret:SOYL/*`]
    }));
    worker.addToRolePolicy(new iam.PolicyStatement({
      actions: ["secretsmanager:GetSecretValue"],
      resources: [`arn:aws:secretsmanager:${this.region}:${this.account}:secret:SOYL/*`]
    }));

    // API Gateway (non-proxy)
    const api = new apigw.LambdaRestApi(this, "SoylApi", {
      handler,
      proxy: false,
      restApiName: "SOYL API",
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS
      }
    });

    const designs = api.root.addResource("designs");
    designs.addMethod("POST", new apigw.LambdaIntegration(handler));
    const concepts = api.root.addResource("concepts");
    const conceptId = concepts.addResource("{designId}");
    conceptId.addMethod("GET", new apigw.LambdaIntegration(handler));

    const health = api.root.addResource("health");
    health.addMethod("GET", new apigw.LambdaIntegration(handler));

    // Basic WAFv2 Web ACL (OWASP managed rules)
    const webAcl = new wafv2.CfnWebACL(this, "SoylWebACL", {
      defaultAction: { allow: {} },
      scope: "REGIONAL",
      visibilityConfig: { cloudWatchMetricsEnabled: true, metricName: "soylWaf", sampledRequestsEnabled: true },
      name: `soyl-waf-${this.account}`,
      rules: [
        {
          name: "AWS-AWSManagedRulesCommonRuleSet",
          priority: 0,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: "AWS",
              name: "AWSManagedRulesCommonRuleSet"
            }
          },
          visibilityConfig: { cloudWatchMetricsEnabled: true, metricName: "commonRuleSet", sampledRequestsEnabled: true }
        }
      ]
    });

    // Associate WAF with API Gateway (via regional resource ARN)
    new wafv2.CfnWebACLAssociation(this, "SoylWebAclAssoc", {
      resourceArn: api.arnForExecuteApi(),
      webAclArn: webAcl.attrArn
    });

    // Cognito User Pool & Client
    const userPool = new cognito.UserPool(this, "SoylUserPool", {
      userPoolName: "soyl-user-pool",
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    const userPoolClient = new cognito.UserPoolClient(this, "SoylUserPoolClient", {
      userPool,
      generateSecret: false,
      supportedIdentityProviders: [cognito.UserPoolClientIdentityProvider.COGNITO]
    });

    // Granting minimal invocation permissions to Lambdas to use Cognito (if needed)
    handler.addToRolePolicy(new iam.PolicyStatement({
      actions: ["cognito-idp:AdminGetUser", "cognito-idp:ListUsers"],
      resources: [userPool.userPoolArn]
    }));

    // Outputs
    new cdk.CfnOutput(this, "ApiUrl", { value: api.url });
    new cdk.CfnOutput(this, "LambdaName", { value: handler.functionName });
    new cdk.CfnOutput(this, "ImageWorkerName", { value: worker.functionName });
    new cdk.CfnOutput(this, "DynamoTable", { value: table.tableName });
    new cdk.CfnOutput(this, "S3Bucket", { value: bucket.bucketName });
    new cdk.CfnOutput(this, "ImageQueueUrl", { value: imageQueue.queueUrl });
    new cdk.CfnOutput(this, "CognitoUserPoolId", { value: userPool.userPoolId });
    new cdk.CfnOutput(this, "CognitoUserPoolClientId", { value: userPoolClient.userPoolClientId });
  }
}
