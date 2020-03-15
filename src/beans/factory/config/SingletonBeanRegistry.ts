import { Interface } from '@tspring/core'

export interface SingletonBeanRegistry {
  registerSingleton(beanName: string, singletonObject: Object): void
  getSingleton<T extends Object>(beanName: string): T | undefined
  containsSingleton(beanName: string): boolean
  getSingletonNames(): string[]
  getSingletonCount(): number
}

export const SingletonBeanRegistry = new Interface('SingletonBeanRegistry')
