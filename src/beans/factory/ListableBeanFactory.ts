import { BeanFactory } from './BeanFactory'
import { Class, Interface } from '@tspring/core'

export interface ListableBeanFactory extends BeanFactory {
  getBeansWithAnnotation (annotationType: symbol): Map<string, any>
  getBeansOfType<T>(type: Class<T>): Map<string, T>
  getBeansOfType<T>(type: Class<T>, includeNonSingletons: boolean, allowEagerInit: boolean): Map<string, T>
  getBeanDefinitionNames(): string[]
  containsBeanDefinition(baenName: string): boolean
	getBeanNamesForType(type: Class<Object> | Interface, includeNonSingletons: boolean, allowEagerInit: boolean): string[]
}

export const ListableBeanFactory = new Interface('ListableBeanFactory', [BeanFactory])
