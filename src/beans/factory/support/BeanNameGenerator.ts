import { BeanDefinition } from '../config/BeanDefinition'
import { BeanDefinitionRegistry } from './BeanDefinitionRegistry'
import { Interface } from '@tspring/core'

export interface BeanNameGenerator {
	generateBeanName(definition: BeanDefinition, registry: BeanDefinitionRegistry): string
}

export const BeanNameGenerator = new Interface('BeanNameGenerator')
