# Set up a serverless CockroachLabs Cluster

## Prerequisites

There are a few prerequisites necessary to use the CockroachLabs::ServerlessCluster::CockroachDB resource.

1. You need a CockroachLabs Cloud account. See [Quickstart with CockroachDB](https://www.cockroachlabs.com/docs/cockroachcloud/quickstart.html) for instructions on how to set this up.
2. You need to configure an api key in your cloud account. This will be used by cloudformation to manage the cluster resource.  See [API access](https://www.cockroachlabs.com/docs/cockroachcloud/console-access-management.html#api-access).
3. You need to submit this resource type to AWS Cloudformation. Run ```cfn submit --set-default -v``` from the resource folder.
4. You will need to set up a [Type Configuration](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cloudformation/set-type-configuration.html) for the activated type, containing an **APIKey**.

## Create a Cluster

The following cloudformation template will create a serverless cluster with 2 CockroachDB databases and 3 SQL users, and
output some of the information needed to connect to its databases.

```yaml
---
AWSTemplateFormatVersion: 2010-09-09
Description: Shows how to create a CockroachLabs Cloud Serverless Cluster
Resources:
  CockroachCluster:
    Type: CockroachLabs::ServerlessCluster::CockroachDB
    Properties:
      Name: demo-cluster
      Provider: AWS
      Regions:
        - us-east-1
      SpendLimit: 0
      Databases:
        - Name: Demo-CockroachDB
        - Name: Another_CRDB
      Users:
        - Name: superuser
          Password: supersecret1
        - Name: editor
          Password: abcdefghijkl
        - Name: reader
          Password: mypwd%$#@987

Outputs:
  SQLDNS:
    Description: SQL DNS is used to connect to the database - postgresql://<SQL-USERNAME>:<SQL-PASSWORD>@<SQL-DNS>:26257/<DB-NAME>?sslmode=verify-full
    Value: !GetAtt CockroachCluster.SqlDns
  Certificate:
    Description: CA Certificate to access SQL databases
    Value: !GetAtt CockroachCluster.Certificate
```

## Deploying the resources

You can deploy the above using the [example.yaml](example.yaml)