import { RootBeanDefinition } from './RootBeanDefinition'
import { BeanFactory } from '../BeanFactory'
import { Interface } from '@tspring/core'

export interface InstantiationStrategy {

	instantiate(bd: RootBeanDefinition, beanName: string, owner: BeanFactory): Object

	instantiate(bd: RootBeanDefinition, beanName: string, owner: BeanFactory,	ctor: any, ...args: any[]): Object

	instantiate(bd: RootBeanDefinition, beanName: string, owner: BeanFactory, factoryBean: Object, factoryMethod: any, ...args: any[]): Object

}

export const InstantiationStrategy = new Interface('InstantiationStrategy')
