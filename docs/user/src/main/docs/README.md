# CockroachLabs CloudFormation Resources

This CloudFormation resource type allows a serverless CockroachDB database to be controlled using AWS CloudFormation.

### Why would I want to do this?

Infrastructure-as-code such as CloudFormation is one of the best ways to create and maintain infrastructure that is reliable and secure. Or a CloudFormation template might just be more convenient for some types of automation.

Here is a sample use case this supports:

* [Set up a CockroachDB serverless cluster](stories/serverless-cluster)

### How do I get started?

Follow the [Developer](docs/dev) instructions to install it manually.

You will need to set up a [Type Configuration](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cloudformation/set-type-configuration.html) containing a CockroachLabs Cloud **API Key** in order to reach the CockroachLabs Cluster API correctly.
It is recommended to set the API key into Systems Manager's secure parameter store,
e.g. as `/path/to/cockroachlabs/apikey` and then it can be applied any of this type,
e.g. `CockroachLabs::ServerlessCluster::CockroachDB`, using:

```
aws cloudformation set-type-configuration \
--region us-east-1 \
--type RESOURCE \
--type-name CockroachLabs::ServerlessCluster::CockroachDB \
--configuration-alias default \
--configuration '{"CockroachLabsCloudCredentials":{"ApiKey":"{{resolve:ssm-secure:/path/to/cockroachlabs/apikey}}"}}'
```

You should then be able to run the example use cases above or build your own using the full reference below.

### What is supported?

This project only supports serverless clusters on CockroachLabs' Cloud service at the moment - not 
dedicated clusters. Also, while it would be preferable to have databases and SQL users as their own 
independent resource types, it did not make sense at this point as SQL users are linked directly to
the cluster - not the database, allowing minimal access control over the database. CockroachLabs'
Cluster API is still under development and considerably unstable; once the API becomes more stable,
these resources (databases and users) may be split into their own resource types.

The **Full CockroachLabs CloudFormation Resources Reference** is available [here](resources).