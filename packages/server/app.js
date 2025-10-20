const { App } = require('aws-cdk-lib');
const { SoylStack } = require('./cdk-stack-simple');

const app = new App();
new SoylStack(app, 'SoylStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || '381492072674',
    region: process.env.CDK_DEFAULT_REGION || 'ap-south-1'
  }
});
