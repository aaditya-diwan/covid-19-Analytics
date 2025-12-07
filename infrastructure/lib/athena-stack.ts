import * as cdk from 'aws-cdk-lib';
import * as athena from 'aws-cdk-lib/aws-athena';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface AthenaStackProps extends cdk.StackProps {
  athenaResultsBucket: s3.Bucket;
}

export class AthenaStack extends cdk.Stack {
  public readonly workGroup: athena.CfnWorkGroup;

  constructor(scope: Construct, id: string, props: AthenaStackProps) {
    super(scope, id, props);

    // Create Athena WorkGroup
    this.workGroup = new athena.CfnWorkGroup(this, 'CovidWorkGroup', {
      name: 'covid-analytics-workgroup',
      description: 'WorkGroup for COVID-19 analytics',
      workGroupConfiguration: {
        resultConfiguration: {
          outputLocation: `s3://${props.athenaResultsBucket.bucketName}/`,
          encryptionConfiguration: {
            encryptionOption: 'SSE_S3',
          },
        },
        enforceWorkGroupConfiguration: true,
        publishCloudWatchMetricsEnabled: true,
        bytesScannedCutoffPerQuery: 1000000000,
        engineVersion: {
          selectedEngineVersion: 'AUTO',
        },
      },
    });


    new cdk.CfnOutput(this, 'AthenaWorkGroupName', {
      value: this.workGroup.name!,
      exportName: 'CovidAthenaWorkGroupName',
    });
  }
}