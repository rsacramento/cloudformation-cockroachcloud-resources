# CockroachLabs::ServerlessCluster::CockroachDB

The CockroachLabs::ServerlessCluster::CockroachDB resource creates a serverless cluster to run an instance of CockroachDB.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "CockroachLabs::ServerlessCluster::CockroachDB",
    "Properties" : {
        "<a href="#name" title="Name">Name</a>" : <i>String</i>,
        "<a href="#provider" title="Provider">Provider</a>" : <i>String</i>,
        "<a href="#regions" title="Regions">Regions</a>" : <i>[ String, ... ]</i>,
        "<a href="#spendlimit" title="SpendLimit">SpendLimit</a>" : <i>Integer</i>,
        "<a href="#databases" title="Databases">Databases</a>" : <i>[ <a href="database.md">Database</a>, ... ]</i>,
        "<a href="#users" title="Users">Users</a>" : <i>[ <a href="user.md">User</a>, ... ]</i>,
    }
}
</pre>

### YAML

<pre>
Type: CockroachLabs::ServerlessCluster::CockroachDB
Properties:
    <a href="#name" title="Name">Name</a>: <i>String</i>
    <a href="#provider" title="Provider">Provider</a>: <i>String</i>
    <a href="#regions" title="Regions">Regions</a>: <i>
      - String</i>
    <a href="#spendlimit" title="SpendLimit">SpendLimit</a>: <i>Integer</i>
    <a href="#databases" title="Databases">Databases</a>: <i>
      - <a href="database.md">Database</a></i>
    <a href="#users" title="Users">Users</a>: <i>
      - <a href="user.md">User</a></i>
</pre>

## Properties

#### Name

Name must be 6-20 characters in length and can include numbers, lowercase letters, and dashes (but no leading or trailing dashes).

_Required_: Yes

_Type_: String

_Pattern_: <code>^[a-z0-9][a-z0-9-]{4,18}[a-z0-9]$</code>

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### Provider

Cloud provider to run the cluster (Amazon Web Services or Google Cloud Platform).

_Required_: Yes

_Type_: String

_Allowed Values_: <code>AWS</code> | <code>GCP</code>

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### Regions

Region to run the CockroachDB cluster on Amazon Web Services (AWS) or Google Cloud Platform (GCP).

_Required_: Yes

_Type_: List of String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### SpendLimit

Spend limit in US cents. A credit card must be registered in the CockroachLabs account for any limit above zero.

_Required_: No

_Type_: Integer

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Databases

Enter at least one database name to be created in the serverless cluster.

_Required_: No

_Type_: List of <a href="database.md">Database</a>

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### Users

A collection of pairs of usernames and passwords to access databases in the cluster.

_Required_: No

_Type_: List of <a href="user.md">User</a>

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the Id.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### Id

Returns the <code>Id</code> value.

#### State

Returns the <code>State</code> value.

#### Certificate

Save the CA certificate provided by the cluster to the default PostgreSQL certificate directory on your machine. (Possibly $HOME/.postgresql/ on Unix-based systems; $env:appdata\postgresql\ on Windows)

