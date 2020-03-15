import { Interface } from '@tspring/core'

export interface BeanMetadataElement {
  getSource<T extends Object>(): T
}

export const BeanMetadataElement = new Interface('BeanMetadataElement')
