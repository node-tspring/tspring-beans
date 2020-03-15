import { Class, Interface } from '@tspring/core'
import { InstantiationAwareBeanPostProcessor } from './InstantiationAwareBeanPostProcessor'

export interface SmartInstantiationAwareBeanPostProcessor extends InstantiationAwareBeanPostProcessor {

	predictBeanType(beanClass: Class<Object>, beanName: string): Class<Object> | undefined

	// determineCandidateConstructors(beanClass: Class<Object>, beanName: string): Constructor<any>

	getEarlyBeanReference(bean: Object, beanName: string): Object

}

export const SmartInstantiationAwareBeanPostProcessor = new Interface(
	'SmartInstantiationAwareBeanPostProcessor',
	[InstantiationAwareBeanPostProcessor]
)
