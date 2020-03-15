import { BeanFactoryPostProcessor } from '../config/BeanFactoryPostProcessor'
import { BeanDefinitionRegistry } from './BeanDefinitionRegistry'
import { Interface } from '@tspring/core'

export interface BeanDefinitionRegistryPostProcessor extends BeanFactoryPostProcessor {

	postProcessBeanDefinitionRegistry(registry: BeanDefinitionRegistry): void

}

export const BeanDefinitionRegistryPostProcessor = new Interface(
  'BeanDefinitionRegistryPostProcessor',
  [BeanFactoryPostProcessor]
)
