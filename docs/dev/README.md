# cloudformation-cockroachlabs

## Set up local type configuration

When running contract or SAM tests locally, the resources expect the CockroachCloud API key to be available via the type configuration.
Executing this in the console from the project root will add it. Replace the values inside the __square__ brackets with the actual values for testing
```bash
cat << EOF >> ~/.cfn-cli/typeConfiguration.json
{
    "CockroachLabsCloudCredentials": {
        "ApiKey": [CockroachCloud API Key]
    }
}
EOF
```

See [API access](https://www.cockroachlabs.com/docs/cockroachcloud/console-access-management.html#api-access)

You must have a CockroahLabs Cloud account to run these tests.

## Known issues

1. Availability regions must match service providers during contract tests. In case it does not, the test will fail.
2. Due to a [bug](https://github.com/aws-cloudformation/cloudformation-cli-typescript-plugin/issues/97) in the [Cloudformation Typescript Plugin](https://github.com/aws-cloudformation/cloudformation-cli-typescript-plugin), the schema is allowing repeated databases and users. When that happens, tests will fail.
3. Also due to the same but, tags are not yet implemented.
