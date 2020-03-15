import { Aware } from './Aware'
import { Interface } from '@tspring/core'

export interface BeanNameAware extends Aware{
	setBeanName(name: string): void
}

export const BeanNameAware = new Interface('BeanNameAware', [Aware])
