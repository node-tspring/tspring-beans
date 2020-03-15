import { ConfigurableListableBeanFactory } from './ConfigurableListableBeanFactory'
import { Interface } from '@tspring/core'

export interface BeanFactoryPostProcessor {
	postProcessBeanFactory(beanFactory: ConfigurableListableBeanFactory): void
}

export const BeanFactoryPostProcessor = new Interface('BeanFactoryPostProcessor')
