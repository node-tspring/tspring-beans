import { BeansException } from '../BeansException'
import { TypeDef } from '@tspring/core'

export class BeanNotOfRequiredTypeException extends BeansException {
  constructor (beanName: string, requiredType: TypeDef, actualType: TypeDef) {
    super(`Bean named '${beanName}' is expected to be of type '${requiredType.name}' but was actually of type '${actualType.name}'`)
  }
}
