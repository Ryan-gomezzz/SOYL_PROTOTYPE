import * as cdk from 'aws-cdk-lib';
import { SoylStack } from './cdk-stack.js';

const app = new cdk.App();
new SoylStack(app, 'SoylStack', { 
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1' 
  }
});
