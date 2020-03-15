import { Interface } from '@tspring/core'

export interface Mergeable {
	isMergeEnabled(): boolean
	merge(parent: Object ): Object
}

export const Mergeable = new Interface('Mergeable')
