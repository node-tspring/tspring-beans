import { Interface } from '@tspring/core'

export interface ObjectFactory<T> {
  getObject(): T
}

export const ObjectFactory = new Interface('ObjectFactory')
