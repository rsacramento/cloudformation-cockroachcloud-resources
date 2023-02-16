export type ClusterPayload = {
	[i: string]: any
	regions: [{ [i: string]: any }]
}

export type ApiError = {
	code: number
	message: string
	details?: []
}

export type CockroachLabsError = {
	status: number
	statusText?: string
	data?: ApiError
	response?: any
	error?: Error
}

export const CockroachLabsNotFoundError: CockroachLabsError = {
	status: 404,
	error: new Error('CockroachLabs\' Cluster API returned the requested resource but it is marked as "DELETED"'),
}

export type ResponseWithHttpInfo = {
	data: any
	response: {
		status: number
		text: string
		body: any
	}
}

export class ClusterPostRequest {
	[i: string]: any
	name: string
	provider: string
	spec: {
		serverless: {
			regions: string[]
			spend_limit: number
		}
	}
}
