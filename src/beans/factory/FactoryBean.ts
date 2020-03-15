import { Class, Interface } from '@tspring/core'

export interface FactoryBean<T> {
  getObject(): T
  getObjectType(): Class<T>
  isSingleton(): boolean
}

export const FactoryBean = new Interface('FactoryBean')
