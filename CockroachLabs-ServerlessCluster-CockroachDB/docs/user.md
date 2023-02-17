# CockroachLabs::ServerlessCluster::CockroachDB User

A username/password pair to associate with the cluster/database.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "<a href="#name" title="Name">Name</a>" : <i>String</i>,
    "<a href="#password" title="Password">Password</a>" : <i>String</i>
}
</pre>

### YAML

<pre>
<a href="#name" title="Name">Name</a>: <i>String</i>
<a href="#password" title="Password">Password</a>: <i>String</i>
</pre>

## Properties

#### Name

User name must start with a letter, number, or underscore; must contain only letters, numbers, dashes, periods or underscores; and must be between 1 and 63 characters.

_Required_: Yes

_Type_: String

_Pattern_: <code>^[a-zA-Z0-9_][a-zA-Z0-9-_.]{0,62}$</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Password

A password for this user. Password must be 12-501 characters long and can include numbers, letters and some symbols (#$%&@^~<>*+.!?=_-)

_Required_: Yes

_Type_: String

_Pattern_: <code>^[A-Za-z0-9#$%&@^~<>*+!?=_-]{12,501}$</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

