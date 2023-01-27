# CockroachLabs::Clusters::ServerlessCluster

The CockroachLabs::Clusters::ServerlessCluster resource creates a serverless cluster to run an instance of CockroachDB.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "CockroachLabs::Clusters::ServerlessCluster",
    "Properties" : {
        "<a href="#name" title="Name">Name</a>" : <i>String</i>,
        "<a href="#provider" title="Provider">Provider</a>" : <i>String</i>,
        "<a href="#regions" title="Regions">Regions</a>" : <i>[ String, ... ]</i>,
        "<a href="#spendlimit" title="SpendLimit">SpendLimit</a>" : <i>Integer</i>
    }
}
</pre>

### YAML

<pre>
Type: CockroachLabs::Clusters::ServerlessCluster
Properties:
    <a href="#name" title="Name">Name</a>: <i>String</i>
    <a href="#provider" title="Provider">Provider</a>: <i>String</i>
    <a href="#regions" title="Regions">Regions</a>: <i>
      - String</i>
    <a href="#spendlimit" title="SpendLimit">SpendLimit</a>: <i>Integer</i>
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

_Required_: Yes

_Type_: Integer

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the ClusterId.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### ClusterId

Returns the <code>ClusterId</code> value.

#### State

The state of the cluster.

