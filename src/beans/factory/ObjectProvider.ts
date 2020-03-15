import { ObjectFactory } from './ObjectFactory'
import { Interface } from '@tspring/core'

export interface ObjectProvider<T> extends ObjectFactory<T> {
  getObject<T>(): T
  getObject(...args: any[]): T

  getIfUnique(): T | undefined
  getIfAvailable(): T | undefined
}

export const ObjectProvider = new Interface('ObjectProvider', [ObjectFactory])
