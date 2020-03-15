import { Interface } from '@tspring/core'

export interface BeanPostProcessor {

	postProcessBeforeInitialization(bean: Object, beanName: string): Object | undefined

	postProcessAfterInitialization(bean: Object, beanName: string): Object | undefined

}

export const BeanPostProcessor = new Interface('BeanPostProcessor')
