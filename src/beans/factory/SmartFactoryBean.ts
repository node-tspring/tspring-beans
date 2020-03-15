import { FactoryBean } from './FactoryBean'
import { Interface } from '@tspring/core'

export interface SmartFactoryBean<T> extends FactoryBean<T> {
	isPrototype(): boolean
	isEagerInit(): boolean
}

export const SmartFactoryBean = new Interface('SmartFactoryBean', [FactoryBean])
