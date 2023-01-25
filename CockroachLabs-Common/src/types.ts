export type ApiError = {
	code: number
	message: string
	details?: []
}

export type CockroachLabsError = {
	code?: string
	status?: number
	response?: {
		status?: number
		statusText?: string
		data?: ApiError
	}
	error?: Error
}

export const CockroachLabsNotFoundError: CockroachLabsError = {
	status: 404,
	error: new Error('CockroachLabs\' Cloud API returned the requested resource but it is marked as "DELETED"'),
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
