import { BeanPostProcessor } from './BeanPostProcessor'
import { Class, Interface } from '@tspring/core'
import { PropertyValues } from '../../PropertyValues'

export interface InstantiationAwareBeanPostProcessor extends BeanPostProcessor {

	postProcessBeforeInstantiation(beanClass: Class<Object> , beanName: string): Object | undefined

	postProcessAfterInstantiation(bean: Object, beanName: string): boolean | undefined

  postProcessProperties(pvs: PropertyValues, bean: Object , beanName: string): PropertyValues | undefined

}

export const InstantiationAwareBeanPostProcessor = new Interface('InstantiationAwareBeanPostProcessor', [BeanPostProcessor])
