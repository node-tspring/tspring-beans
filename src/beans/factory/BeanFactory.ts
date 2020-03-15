import { Class, Interface } from '@tspring/core'
import { ObjectProvider } from './ObjectProvider'

export interface BeanFactory {
  getBean<T>(name: string): T
  getBean<T>(name: string, requiredType: Class<T>): T
  getBean<T>(name: string, ...args: any[]): T
  getBean<T>(requiredType: Class<T>): T
  getBean<T>(requiredType: Class<T>, ...args: any[]): T

  containsBean(name: string): boolean

  isSingleton(name: string): boolean
  isTypeMatch(name: string, typeToMatch: Class<Object> | Interface): boolean
  getType(name: string): Class<Object> | undefined

	getBeanProvider<T>(requiredType: Class<T>): ObjectProvider<T>
}
export const BeanFactory = new (class extends Interface{
  readonly FACTORY_BEAN_PREFIX = '&'
})('BeanFactory')
