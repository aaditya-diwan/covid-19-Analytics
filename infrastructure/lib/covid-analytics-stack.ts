#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StorageStack } from '../lib/storage-stack';
import { GlueStack } from '../lib/glue-stack';
import { AthenaStack } from '../lib/athena-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};


const storageStack = new StorageStack(app, 'CovidStorageStack', { env });

const glueStack = new GlueStack(app, 'CovidGlueStack', {
  env,
  dataBucket: storageStack.dataBucket,
});

const athenaStack = new AthenaStack(app, 'CovidAthenaStack', {
  env,
  athenaResultsBucket: storageStack.athenaResultsBucket,
});

glueStack.addDependency(storageStack);
athenaStack.addDependency(storageStack);