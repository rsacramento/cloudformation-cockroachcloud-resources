import { ResourceModel, TypeConfigurationModel } from "./models"
import { AbstractCockroachLabsResource } from "../../CockroachLabs-Common/src/abstract-cockroachlabs-resource"
import { RetryableCallbackContext } from "../../CockroachLabs-Common/src/abstract-base-resource"
import axios from "axios"
import { CaseTransformer, Transformer } from "../../CockroachLabs-Common/src/util"
import { CockroachLabsNotFoundError } from "../../CockroachLabs-Common/src/types"
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
	maxRetries = 2

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
			["IN_PROGRESS", "PENDING"].includes(progressEvent.resourceModel.state)
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

		progressEvent.resourceModel.certificate = await this.getCertificate(progressEvent.resourceModel?.id)

		return progressEvent
	}

	async create(model: ResourceModel, typeConfiguration: TypeConfigurationModel): Promise<ClusterPayload> {
		const axiosResponse = await axios.post<ClusterPayload>(
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

		return axiosResponse.data
	}

	async delete(model: ResourceModel, typeConfiguration: TypeConfigurationModel | undefined): Promise<void> {
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

		const axiosResponse = await axios.get<ClusterPayload>(`${this.apiEndpoint}/api/v1/clusters/${model.id}`, {
			headers: {
				Authorization: `Bearer ${typeConfiguration.cockroachLabsCloudCredentials.apiKey}`,
				"User-Agent": this.userAgent,
			},
		})

		if (Object.keys(axiosResponse.data).length === 0 || axiosResponse.data.state === "DELETED") {
			throw CockroachLabsNotFoundError
		}

		return axiosResponse.data
	}

	async list(model: ResourceModel, typeConfiguration: TypeConfigurationModel | undefined): Promise<ResourceModel[]> {
		const axiosResponse = await axios.get<{ clusters: ClusterPayload[] }>(`${this.apiEndpoint}/api/v1/clusters`, {
			headers: {
				Authorization: `Bearer ${typeConfiguration.cockroachLabsCloudCredentials.apiKey}`,
				"User-Agent": this.userAgent,
			},
		})

		return axiosResponse.data.clusters
			.map(backendPayload => {
				return new ResourceModel(
					Transformer.for(backendPayload).transformKeys(CaseTransformer.SNAKE_TO_CAMEL).forModelIngestion().transform()
				)
			})
			.filter((model: ResourceModel) => {
				return !["DELETED"].includes(model.state)
			})
	}

	async update(model: ResourceModel, typeConfiguration: TypeConfigurationModel | undefined): Promise<void> {
		await axios.patch(
			`${this.apiEndpoint}/clusters/${model.id}`,
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

	newModel(partial: any): ResourceModel {
		return new ResourceModel(partial)
	}

	setModelFrom(model: ResourceModel, from: ClusterPayload | undefined): ResourceModel {
		if (!from) {
			return model
		}

		return new ResourceModel({
			...model,
			...Transformer.for(from).transformKeys(CaseTransformer.SNAKE_TO_CAMEL).forModelIngestion().transform(),
			regions: from.regions.map(r => r.name),
			id: from.id,
		})
	}

	private async getCertificate(id: string): Promise<string> {
		const { data } = await axios.get(`${this.apiEndpoint}/clusters/${id}/cert`, {
			headers: {
				"User-Agent": this.userAgent,
			},
		})

		return data
	}

	protected isReady(model: ResourceModel): Boolean {
		return model.state == "CREATED"
	}
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel, null, null, TypeConfigurationModel)!

export const entrypoint = resource.entrypoint

export const testEntrypoint = resource.testEntrypoint
