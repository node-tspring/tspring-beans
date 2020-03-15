import { BeanFactory } from './BeanFactory'
import { Aware } from './Aware'
import { Interface } from '@tspring/core'

export interface BeanFactoryAware extends Aware {
	setBeanFactory(beanFactory: BeanFactory): void
}

export const BeanFactoryAware = new Interface('BeanFactoryAware', [Aware])
