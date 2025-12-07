import * as cdk from 'aws-cdk-lib';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface GlueStackProps extends cdk.StackProps {
  dataBucket: s3.Bucket;
}

export class GlueStack extends cdk.Stack {
  public readonly database: glue.CfnDatabase;
  public readonly crawler: glue.CfnCrawler;

  constructor(scope: Construct, id: string, props: GlueStackProps) {
    super(scope, id, props);

    this.database = new glue.CfnDatabase(this, 'CovidDatabase', {
      catalogId: this.account,
      databaseInput: {
        name: 'covid_data_warehouse',
        description: 'COVID-19 analytics data warehouse',
      },
    });

    const crawlerRole = new iam.Role(this, 'GlueCrawlerRole', {
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'),
      ],
    });

    props.dataBucket.grantRead(crawlerRole);

    this.crawler = new glue.CfnCrawler(this, 'CovidDataCrawler', {
      name: 'covid-data-crawler',
      role: crawlerRole.roleArn,
      databaseName: this.database.ref,
      targets: {
        s3Targets: [
          {
            path: `s3://${props.dataBucket.bucketName}/raw-data/`,
          },
        ],
      },
      schemaChangePolicy: {
        updateBehavior: 'UPDATE_IN_DATABASE',
        deleteBehavior: 'LOG',
      },
      configuration: JSON.stringify({
        Version: 1.0,
        CrawlerOutput: {
          Partitions: { AddOrUpdateBehavior: 'InheritFromTable' },
        },
      }),
    });

    const owidTable = new glue.CfnTable(this, 'OWIDCovidTable', {
      catalogId: this.account,
      databaseName: this.database.ref,
      tableInput: {
        name: 'owid_covid_data',
        description: 'Our World in Data COVID-19 dataset',
        tableType: 'EXTERNAL_TABLE',
        parameters: {
          'skip.header.line.count': '1',
          'classification': 'csv',
        },
        storageDescriptor: {
          columns: [
            { name: 'iso_code', type: 'string' },
            { name: 'continent', type: 'string' },
            { name: 'location', type: 'string' },
            { name: 'date', type: 'date' },
            { name: 'total_cases', type: 'double' },
            { name: 'new_cases', type: 'double' },
            { name: 'total_deaths', type: 'double' },
            { name: 'new_deaths', type: 'double' },
            { name: 'total_vaccinations', type: 'double' },
            { name: 'people_vaccinated', type: 'double' },
            { name: 'people_fully_vaccinated', type: 'double' },
            { name: 'new_vaccinations', type: 'double' },
            { name: 'population', type: 'double' },
            { name: 'population_density', type: 'double' },
            { name: 'median_age', type: 'double' },
            { name: 'aged_65_older', type: 'double' },
            { name: 'aged_70_older', type: 'double' },
            { name: 'gdp_per_capita', type: 'double' },
          ],
          location: `s3://${props.dataBucket.bucketName}/raw-data/owid/`,
          inputFormat: 'org.apache.hadoop.mapred.TextInputFormat',
          outputFormat: 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat',
          serdeInfo: {
            serializationLibrary: 'org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe',
            parameters: {
              'field.delim': ',',
            },
          },
        },
      },
    });

    new cdk.CfnOutput(this, 'GlueDatabaseName', {
      value: this.database.ref,
      exportName: 'CovidGlueDatabaseName',
    });

    new cdk.CfnOutput(this, 'CrawlerName', {
      value: this.crawler.name!,
      exportName: 'CovidCrawlerName',
    });
  }
}