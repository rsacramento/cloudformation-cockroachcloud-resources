import {
	BaseModel,
	exceptions,
	ResourceHandlerRequest,
	LoggerProxy,
} from "@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib"
import { AbstractBaseResource } from "./abstract-base-resource"
import { CockroachLabsError } from "./types"

export abstract class AbstractCockroachLabsResource<
	ResourceModelType extends BaseModel,
	GetResponseData,
	CreateResponseData,
	UpdateResponseData,
	TypeConfigurationM
> extends AbstractBaseResource<
	ResourceModelType,
	GetResponseData,
	CreateResponseData,
	UpdateResponseData,
	CockroachLabsError,
	TypeConfigurationM
> {
	processRequestException(e: CockroachLabsError, request: ResourceHandlerRequest<ResourceModelType>) {
		const errors = [e.error?.message]
		let status = e.status
		if (e.response) {
			status = e.response.status
			errors.push(`[${status}] ${e.response.statusText} ${e.response.data.message}`)
		}
		const errorMessage = errors.join("\n")
		// let status = e.status != undefined ? e.status : e.response.status
		switch (status) {
			case 400:
				throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier)
			case 401:
				throw new exceptions.InvalidCredentials(errorMessage)
			case 403:
				throw new exceptions.AccessDenied(`Access denied, please check your API key: ${errorMessage}`)
			case 404:
				throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier)
			case 409:
				throw new exceptions.ResourceConflict(errorMessage)
			case 429:
				throw new exceptions.ServiceLimitExceeded(errorMessage)
			default:
				throw new exceptions.ServiceInternalError(
					`Unexpected error occurred, see serialized exception below:\n${JSON.stringify(e)}`
				)
		}
	}
}
