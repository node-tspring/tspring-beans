import { Interface } from '@tspring/core'

export interface InitializingBean {
  afterPropertiesSet(): void
}

export const InitializingBean = new Interface('InitializingBean')
