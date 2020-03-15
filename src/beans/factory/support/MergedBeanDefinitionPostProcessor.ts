import { BeanPostProcessor } from '../config/BeanPostProcessor'
import { RootBeanDefinition } from './RootBeanDefinition'
import { Class, Interface } from '@tspring/core'

export interface MergedBeanDefinitionPostProcessor extends BeanPostProcessor {

  postProcessMergedBeanDefinition(beanDefinition: RootBeanDefinition , beanType: Class<Object> , beanName: string ): void

  resetBeanDefinition(beanName: string): void

}

export const MergedBeanDefinitionPostProcessor = new Interface('MergedBeanDefinitionPostProcessor', [BeanPostProcessor])
