import { IllegalStateException } from '@tspring/core'

export class ImplicitlyAppearedSingletonException extends IllegalStateException {
  constructor() {
    super('About-to-be-created singleton instance implicitly appeared through the creation of the factory bean that its bean definition points to')
  }
}
