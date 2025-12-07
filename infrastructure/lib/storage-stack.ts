import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class StorageStack extends cdk.Stack {
  public readonly dataBucket: s3.Bucket;
  public readonly athenaResultsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    this.dataBucket = new s3.Bucket(this, 'CovidDataBucket', {
      bucketName: `covid-analytics-data-${this.account}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          id: 'DeleteOldVersions',
          noncurrentVersionExpiration: cdk.Duration.days(30),
        },
      ],
    });


    this.athenaResultsBucket = new s3.Bucket(this, 'AthenaResultsBucket', {
      bucketName: `covid-analytics-athena-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          id: 'DeleteOldResults',
          expiration: cdk.Duration.days(7),
        },
      ],
    });

    new cdk.CfnOutput(this, 'DataBucketName', {
      value: this.dataBucket.bucketName,
      exportName: 'CovidDataBucketName',
    });

    new cdk.CfnOutput(this, 'AthenaResultsBucketName', {
      value: this.athenaResultsBucket.bucketName,
      exportName: 'CovidAthenaResultsBucketName',
    });
  }
}