import { BeanFactory } from './BeanFactory'
import { Interface } from '@tspring/core'

export interface HierarchicalBeanFactory extends BeanFactory {
	getParentBeanFactory(): BeanFactory | undefined
	containsLocalBean(name: string): boolean
}

export const HierarchicalBeanFactory = new Interface('HierarchicalBeanFactory', [BeanFactory])
