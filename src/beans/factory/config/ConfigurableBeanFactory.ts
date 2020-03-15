import { ConversionService, StringValueResolver, Interface } from '@tspring/core'
import { BeanDefinition } from './BeanDefinition'
import { SingletonBeanRegistry } from './SingletonBeanRegistry'
import { HierarchicalBeanFactory } from '../HierarchicalBeanFactory'
import { BeanFactory } from '../BeanFactory'
import { BeanPostProcessor } from './BeanPostProcessor'
import { TypeConverter } from '../../TypeConverter'
import { BeanExpressionResolver } from './BeanExpressionResolver'


export interface ConfigurableBeanFactory extends HierarchicalBeanFactory, SingletonBeanRegistry {

  setConversionService(conversionService: ConversionService): void

  getConversionService(): ConversionService | undefined

	setCacheBeanMetadata(cacheBeanMetadata: boolean): void

	isCacheBeanMetadata(): boolean

  getMergedBeanDefinition(beanName: string): BeanDefinition

  isFactoryBean(name: string): boolean

	setParentBeanFactory(parentBeanFactory: BeanFactory): void

  addBeanPostProcessor(beanPostProcessor: BeanPostProcessor): void

	getBeanPostProcessorCount(): number

	setTypeConverter(typeConverter: TypeConverter): void

  getTypeConverter(): TypeConverter

	setCurrentlyInCreation(beanName: string, inCreation: boolean): void

	isCurrentlyInCreation(beanName: string): boolean

	registerDependentBean(beanName: string, dependentBeanName: string): void

	getDependentBeans(beanName: string): string[]

	getDependenciesForBean(beanName: string): string[]

	// destroyBean(beanName: string, beanInstance: Object): void

	// destroyScopedBean(beanName: string): void

	// destroySingletons(): void

	setBeanExpressionResolver(resolver: BeanExpressionResolver | undefined): void

	getBeanExpressionResolver(): BeanExpressionResolver | undefined

	addEmbeddedValueResolver(valueResolver: StringValueResolver): void

	hasEmbeddedValueResolver(): boolean

	resolveAliases(valueResolver: StringValueResolver): void

	resolveEmbeddedValue(value: string): string | undefined

}

export const ConfigurableBeanFactory = new (class extends Interface{
	readonly SCOPE_SINGLETON = 'singleton'
  readonly SCOPE_PROTOTYPE = 'prototype'
})('ConfigurableBeanFactory', [HierarchicalBeanFactory, SingletonBeanRegistry])
