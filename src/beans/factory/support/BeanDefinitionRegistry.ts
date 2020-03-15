import { BeanDefinition } from '../config/BeanDefinition'
import { Interface } from '@tspring/core'

export interface BeanDefinitionRegistry {
  registerBeanDefinition(beanName: string | symbol, beanDefinition: BeanDefinition): void
  getBeanDefinitionNames(): string[]
  getBeanDefinition(beanName: string): BeanDefinition
  containsBeanDefinition(beanName: string): boolean
}

export const BeanDefinitionRegistry = new Interface('BeanDefinitionRegistry')
