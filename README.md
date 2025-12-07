# Project Setup & Deployment Guide

This project uses AWS CDK to provision and deploy AWS resources automatically instead of creating them manually.

## Infrastructure Deployment (AWS CDK)
### Setting up AWS Account:

1. Install AWS CLI v2
2. Configure your account credentials using the command `aws configure` on command line interface

### Steps to deploy to your AWS Account:

1. Go to the infrastructure directory
   `cd infrastructure`

2. Synthesize the project
   `cdk synth`

3. Bootstrap the AWS account
   `cdk bootstrap`

4. Deploy the stack
   `cdk deploy`

This will deploy all the resources in your AWS account.

## Data Pipeline Setup

There are two scripts:

- download_data.py - downloads the OWID COVID data
- process_data.py - cleans the data

Run them in order:
python download_data.py
python process_data.py

## Upload Data to AWS S3

After processing the data:
- Manually upload the cleaned files to the configured S3 bucket

This will:
- Trigger the AWS Glue job
- Make the data available in Amazon Athena

## Run Metabase Using Docker

Run the following command:

`docker run -d -p 3000:3000 -v ~/metabase-data:/metabase-data -e MB_DB_FILE=/metabase-data/metabase.db --name metabase metabase/metabase`

Then open:
`http://localhost:3000`

Configure:
- AWS credentials
- Amazon Athena connection details

## Run Analytics Queries

Open:
sql/analytics-queries.sql

Run the queries in Metabase to generate visualizations.
