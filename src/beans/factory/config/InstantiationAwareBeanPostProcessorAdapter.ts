import { SmartInstantiationAwareBeanPostProcessor } from './SmartInstantiationAwareBeanPostProcessor'
import { Class, Implements } from '@tspring/core'
import { PropertyValues } from '../../PropertyValues'

@Implements(SmartInstantiationAwareBeanPostProcessor)
export abstract class InstantiationAwareBeanPostProcessorAdapter implements SmartInstantiationAwareBeanPostProcessor {

  predictBeanType(beanClass: Class<Object>, beanName: string): Class<Object> | undefined {
    return undefined
  }

  getEarlyBeanReference(bean: Object, beanName: string) {
    return bean
  }

  postProcessBeforeInstantiation(beanClass: Class<Object>, beanName: string) {
    return undefined
  }

  postProcessAfterInstantiation(bean: Object, beanName: string): boolean {
    return true
  }

  postProcessProperties(pvs: PropertyValues, bean: Object, beanName: string): PropertyValues | undefined {
    return undefined
  }

  postProcessBeforeInitialization(bean: Object, beanName: string) {
    return bean
  }

  postProcessAfterInitialization(bean: Object, beanName: string) {
    return bean
  }
}
