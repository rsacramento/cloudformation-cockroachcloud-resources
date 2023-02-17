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
  CockroachCluster:
    Type: CockroachLabs::ServerlessCluster::CockroachDB
    Properties:
      Name: Demo-Cluster
      Provider: AWS
      Regions:
        - us-east-1
      SpendLimit: 0
      Databases:
        - Name: Demo-CockroachDB
        - Name: Another_CRDB
      Users:
        - Name: admin
          Password: supersecret
        - Name: editor
          Password: abcdef
        - Name: user
          Password: mypwd%$#@
```

## Deploying the resources

You can deploy the above using the [example.yaml](example.yaml)