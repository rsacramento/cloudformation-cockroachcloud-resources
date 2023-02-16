import { Database, ResourceModel, TypeConfigurationModel } from "./models"
import { AbstractCockroachLabsResource } from "../../CockroachLabs-Common/src/abstract-cockroachlabs-resource"
import { RetryableCallbackContext } from "../../CockroachLabs-Common/src/abstract-base-resource"
import axios from "axios"
import axiosRetry from "axios-retry"
import { CaseTransformer, Transformer } from "../../CockroachLabs-Common/src/util"
import { CockroachLabsNotFoundError, CockroachLabsError } from "../../CockroachLabs-Common/src/types"
import {
	Action,
	exceptions,
	handlerEvent,
	LoggerProxy,
	OperationStatus,
	Optional,
	ProgressEvent,
	ResourceHandlerRequest,
	SessionProxy,
} from "@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib"

import { version } from "../package.json"

type ClusterPayload = {
	[i: string]: any
	regions: [{ [i: string]: any }]
}

class Resource extends AbstractCockroachLabsResource<
	ResourceModel,
	ClusterPayload,
	ClusterPayload,
	void,
	TypeConfigurationModel
> {
	private userAgent = `AWS CloudFormation (+https://aws.amazon.com/cloudformation/) CloudFormation resource ${this.typeName}/${version}`
	private apiEndpoint = "https://cockroachlabs.cloud"
	maxRetries = 3

	@handlerEvent(Action.Create)
	async createHandler(
		session: Optional<SessionProxy>,
		request: ResourceHandlerRequest<ResourceModel>,
		callbackContext: RetryableCallbackContext,
		logger: LoggerProxy,
		typeConfiguration: TypeConfigurationModel
	): Promise<ProgressEvent<ResourceModel, RetryableCallbackContext>> {
		const progressEvent = await super.createHandler(session, request, callbackContext, logger, typeConfiguration)

		if (
			progressEvent.status == OperationStatus.Success &&
			["IN_PROGRESS", "PENDING", "CREATING"].includes(progressEvent.resourceModel.state)
		) {
			if (callbackContext.retry <= this.maxRetries) {
				let retry = callbackContext.retry ? callbackContext.retry + 1 : 1
				let newProgressEvent = ProgressEvent.progress<ProgressEvent<ResourceModel, RetryableCallbackContext>>(
					progressEvent.resourceModel,
					{
						retry: retry,
					}
				)
				newProgressEvent.callbackDelaySeconds = 5 * retry
				return newProgressEvent
			} else {
				throw new exceptions.NotStabilized(`Resource failed to stabilized after ${this.maxRetries} retries`)
			}
		}

		return progressEvent
	}

	async create(model: ResourceModel, typeConfiguration: TypeConfigurationModel): Promise<ClusterPayload> {
		this.setupAxios()
		const { data } = await axios.post<ClusterPayload>(
			`${this.apiEndpoint}/api/v1/clusters`,
			{
				...Transformer.for(model.toJSON())
					.transformKeys(CaseTransformer.PASCAL_TO_SNAKE)
					.transformShape({
						name: "",
						provider: "",
						spec: {
							serverless: {
								regions: <string[]>[],
								spend_limit: Number(),
							},
						},
					})
					.transform(),
			},
			{
				headers: {
					"User-Agent": this.userAgent,
					"Content-Type": "application/json",
					Authorization: `Bearer ${typeConfiguration.cockroachLabsCloudCredentials.apiKey}`,
				},
			}
		)

		return data
	}

	async delete(model: ResourceModel, typeConfiguration: TypeConfigurationModel | undefined): Promise<void> {
		this.setupAxios()
		await axios.delete(`${this.apiEndpoint}/api/v1/clusters/${model.id}`, {
			headers: {
				"User-Agent": this.userAgent,
				Authorization: `Bearer ${typeConfiguration.cockroachLabsCloudCredentials.apiKey}`,
			},
		})
	}

	async get(model: ResourceModel, typeConfiguration: TypeConfigurationModel | undefined): Promise<ClusterPayload> {
		if (typeof model.id === "undefined") {
			throw CockroachLabsNotFoundError
		}

		this.setupAxios()
		const { data } = await axios.get<ClusterPayload>(`${this.apiEndpoint}/api/v1/clusters/${model.id}`, {
			headers: {
				Authorization: `Bearer ${typeConfiguration.cockroachLabsCloudCredentials.apiKey}`,
				"User-Agent": this.userAgent,
			},
		})

		if (Object.keys(data).length === 0 || data.state === "DELETED") {
			throw CockroachLabsNotFoundError
		}

		return data
	}

	async list(model: ResourceModel, typeConfiguration: TypeConfigurationModel | undefined): Promise<ResourceModel[]> {
		this.setupAxios()
		const { data } = await axios.get<{ clusters: ClusterPayload[] }>(`${this.apiEndpoint}/api/v1/clusters`, {
			headers: {
				Authorization: `Bearer ${typeConfiguration.cockroachLabsCloudCredentials.apiKey}`,
				"User-Agent": this.userAgent,
			},
		})

		const loadedClusters = data.clusters.map(
			cluster =>
				new ResourceModel(
					Transformer.for(cluster).transformKeys(CaseTransformer.SNAKE_TO_CAMEL).forModelIngestion().transform()
				)
		)

		return loadedClusters.filter((model: ResourceModel) => !["DELETED", "CREATING"].includes(model.state))
	}

	async update(model: ResourceModel, typeConfiguration: TypeConfigurationModel | undefined): Promise<void> {
		this.setupAxios()
		await axios.patch(
			`${this.apiEndpoint}/api/v1/clusters/${model.id}`,
			{
				...Transformer.for(model.toJSON())
					.transformKeys(CaseTransformer.PASCAL_TO_SNAKE)
					.transformShape({ serverless: { spend_limit: Number } })
					.transform(),
			},
			{
				headers: {
					"User-Agent": this.userAgent,
					"Content-Type": "application/json",
					Authorization: `Bearer ${typeConfiguration.cockroachLabsCloudCredentials.apiKey}`,
				},
			}
		)
	}

	protected newModel(partial: any): ResourceModel {
		return new ResourceModel(partial)
	}

	protected async setModelFrom(
		model: ResourceModel,
		from: ClusterPayload | undefined,
		typeConfiguration: TypeConfigurationModel | undefined
	): Promise<ResourceModel> {
		if (!from) {
			return await model
		}

		let databases: Database[]
		if (model.id === undefined && model.state !== "CREATED") {
			databases = await this.createDatabases(<ResourceModel>{ ...model, id: from.id }, typeConfiguration)
		} else {
			databases = await this.listDatabases(model, typeConfiguration)
		}

		return await new ResourceModel({
			...model,
			...Transformer.for(from).transformKeys(CaseTransformer.SNAKE_TO_CAMEL).forModelIngestion().transform(),
			regions: from.regions.map(r => r.name),
			certificate: await this.getCertificate(from.id),
			databases,
		})
	}

	protected isReady(model: ResourceModel): Boolean {
		return model.state == "CREATED"
	}

	private setupAxios(): void {
		return axiosRetry(axios, {
			retries: this.maxRetries,
			retryDelay: axiosRetry.exponentialDelay,
			retryCondition: _error => true,
		})
	}

	private async getCertificate(id: string): Promise<string> {
		const { data } = await axios
			.get<string>(`${this.apiEndpoint}/clusters/${id}/cert`, {
				headers: {
					"User-Agent": this.userAgent,
				},
			})
			.catch(e => {
				const CockroachLabsError: CockroachLabsError = {
					status: e.response.status,
					statusText: e.response.statusText,
					data: e.response.data,
					response: e.response,
					error: new Error(`\n${JSON.stringify(e)}`),
				}
				throw CockroachLabsError
			})

		return data
	}

	private async createDatabases(model: ResourceModel, typeConfiguration: TypeConfigurationModel): Promise<Database[]> {
		axiosRetry(axios, {
			retries: this.maxRetries,
			retryDelay: axiosRetry.exponentialDelay,
			retryCondition: _error => true,
		})
		await axios.delete(`${this.apiEndpoint}/api/v1/clusters/${model.id}/databases/defaultdb`, {
			headers: {
				"User-Agent": this.userAgent,
				Authorization: `Bearer ${typeConfiguration.cockroachLabsCloudCredentials.apiKey}`,
			},
		})

		const dbPromises = model.databases.map(async props => {
			const { data } = await axios
				.post<Database>(
					`${this.apiEndpoint}/api/v1/clusters/${model.id}/databases`,
					{
						...Transformer.for(props.toJSON()).transformKeys(CaseTransformer.PASCAL_TO_SNAKE).transform(),
					},
					{
						headers: {
							"User-Agent": this.userAgent,
							"Content-Type": "application/json",
							Authorization: `Bearer ${typeConfiguration.cockroachLabsCloudCredentials.apiKey}`,
						},
					}
				)
				.catch(e => {
					const CockroachLabsError: CockroachLabsError = {
						status: e.response.status,
						statusText: e.response.statusText,
						data: e.response.data,
						response: e.response,
						error: new Error(`\n${JSON.stringify(e)}`),
					}
					throw CockroachLabsError
				})
			const dbProps: [string, string | number][] = Object.entries(data).filter(prop => ["name"].includes(prop[0]))
			const db = Object.fromEntries(dbProps)
			return new Database(
				Transformer.for(db).transformKeys(CaseTransformer.SNAKE_TO_CAMEL).forModelIngestion().transform()
			)
		})

		return await Promise.all(dbPromises)
	}

	private async listDatabases(
		model: ResourceModel,
		typeConfiguration: TypeConfigurationModel | undefined
	): Promise<Database[]> {
		const { data } = await axios.get<{ databases: Database[] }>(
			`${this.apiEndpoint}/api/v1/clusters/${model.id}/databases`,
			{
				headers: {
					Authorization: `Bearer ${typeConfiguration.cockroachLabsCloudCredentials.apiKey}`,
					"User-Agent": this.userAgent,
				},
			}
		)

		return data.databases.map(db => {
			const dbProps: [string, string | number][] = Object.entries(db).filter(prop => ["name"].includes(prop[0]))
			const newDb = Object.fromEntries(dbProps)
			return new Database(
				Transformer.for(newDb).transformKeys(CaseTransformer.SNAKE_TO_CAMEL).forModelIngestion().transform()
			)
		})
	}
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel, null, null, TypeConfigurationModel)!

export const entrypoint = resource.entrypoint

export const testEntrypoint = resource.testEntrypoint
