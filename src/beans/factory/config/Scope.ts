import { ObjectFactory } from '../ObjectFactory'
import { Interface } from '@tspring/core'

export interface Scope {
	get(name: string, objectFactory: ObjectFactory<Object>): any

	remove(name: string): any

	registerDestructionCallback(name: string, callback: () => void): void

	resolveContextualObject(key: string): any

	getConversationId(): string

}

export const Scope = new Interface('Scope')
