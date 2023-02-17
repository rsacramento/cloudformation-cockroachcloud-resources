# CockroachLabs Cloudformation resources

This [AWS CloudFormation resource type][1] allows a CockroachLabs Cloud serverless cluster to be controlled using [AWS CloudFormation][2].

There is also [developer documentation](docs/dev) available
if you are interested in building or contributing.

| Resource | Description | Documentation |
| --- | --- | --- |
| CockroachLabs::ServerlessCluster::CockroachDB | This resource type manages a [CockroachLabs serverless cluster][3] | [/CockroachLabs-ServerlessCluster-CockroachDB][4] |

## Prerequisites
* [AWS Account][5]
* [AWS CLI][6]
* [AWS Cloudformation CLI][7]
* [CockroachLabs Cloud account][8] and [API Key][9]

## To get started:

1. Clone this repository and run ```cfn submit --set-default -v ``` from the [resource folder][10] to submit the resource type to your AWS Cloudformation's private repository. It will become visible under "Activated extensions" -> "Privately registered", for the specified region in your Cloudformation account.

2. Specify the configuration data for the registered CockroachLabs CloudFormation resource type, in the given account and region by using the **SetTypeConfiguration** operation:

    For example:

     ```Bash
     $ aws cloudformation set-type-configuration \
      --region us-east-1 \
      --type RESOURCE \
      --type-name CockroachLabs::ServerlessCluster:CockroachDB \
      --configuration-alias default \
      --configuration '{\"CockroachLabsCloudCredentials\":{\"ApiKey\":\"YOURAPIKEY\"}}'
     ```

3. After you have your resource configured, [create your AWS stack][11] that includes the activated CockroachLabs resource.

For more information about available commands and workflows, see the official [AWS documentation][12].

## Example

### [Sample use case][13]

CockroachLabs serverless cluster creation example using the Cloudformation CockroachLabs Cluster resource:

```yaml
---
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

## Special thanks to:

The [CloudSoft][14] crew:
- [Thomas Bouron][15]
- [Lukasz Wlosek][16]
- [Joshua Hall][17]
- [Tony Vattathil][18]

For providing [the examples and boilerplate][19] used in this project.

[1]: https://docs.aws.amazon.com/cloudformation-cli/latest/userguide/resource-types.html
[2]: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html
[3]: https://www.cockroachlabs.com/docs/cockroachcloud/serverless-faqs.html
[4]: ./CockroachLabs-ServerlessCluster-CockroachDB/
[5]: https://aws.amazon.com/account/
[6]: https://aws.amazon.com/cli/
[7]: https://docs.aws.amazon.com/cloudformation-cli/latest/userguide/what-is-cloudformation-cli.html
[8]: https://www.cockroachlabs.com/
[9]: https://www.cockroachlabs.com/docs/cockroachcloud/console-access-management.html#api-access
[10]: ./CockroachLabs-ServerlessCluster-CockroachDB
[11]: https://console.aws.amazon.com/cloudformation/home
[12]: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry.html
[13]: ./docs/user/src/main/docs/README.md
[14]: https://cloudsoft.io/home
[15]: https://github.com/tbouron
[16]: https://github.com/lukiwlosek
[17]: https://github.com/joshuadeanhall
[18]: https://github.com/tonynv
[19]: https://cloudsoft.io/blog/what-we-learned-from-building-60-third-party-resources-for-aws-cloudformation