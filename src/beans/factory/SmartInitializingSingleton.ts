import { Interface } from '@tspring/core'

export interface SmartInitializingSingleton {
	afterSingletonsInstantiated(): void
}

export const SmartInitializingSingleton = new Interface('SmartInitializingSingleton')
