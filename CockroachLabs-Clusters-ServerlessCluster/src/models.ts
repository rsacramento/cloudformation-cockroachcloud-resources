// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'CockroachLabs::Clusters::ServerlessCluster';

    @Exclude()
    protected readonly IDENTIFIER_KEY_CLUSTERID: string = '/properties/ClusterId';

    @Expose({ name: 'ClusterId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'clusterId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    clusterId?: Optional<string>;
    @Expose({ name: 'State' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'state', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    state?: Optional<string>;
    @Expose({ name: 'Name' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'name', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    name?: Optional<string>;
    @Expose({ name: 'Provider' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'provider', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    provider?: Optional<string>;
    @Expose({ name: 'Regions' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'regions', value, obj, [Array]),
        {
            toClassOnly: true,
        }
    )
    regions?: Optional<Array<string>>;
    @Expose({ name: 'SpendLimit' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Integer, 'spendLimit', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    spendLimit?: Optional<integer>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.clusterId != null) {
            identifier[this.IDENTIFIER_KEY_CLUSTERID] = this.clusterId;
        }

        // only return the identifier if it can be used, i.e. if all components are present
        return Object.keys(identifier).length === 1 ? identifier : null;
    }

    @Exclude()
    public getAdditionalIdentifiers(): Array<Dict> {
        const identifiers: Array<Dict> = new Array<Dict>();
        // only return the identifiers if any can be used
        return identifiers.length === 0 ? null : identifiers;
    }
}

export class TypeConfigurationModel extends BaseModel {
    ['constructor']: typeof TypeConfigurationModel;


    @Expose({ name: 'CockroachLabsCloudCredentials' })
    @Type(() => CockroachLabsCloudCredentials)
    cockroachLabsCloudCredentials?: Optional<CockroachLabsCloudCredentials>;

}

export class CockroachLabsCloudCredentials extends BaseModel {
    ['constructor']: typeof CockroachLabsCloudCredentials;


    @Expose({ name: 'ApiKey' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'apiKey', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    apiKey?: Optional<string>;

}
