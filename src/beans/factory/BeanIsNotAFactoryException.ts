import { BeanNotOfRequiredTypeException } from './BeanNotOfRequiredTypeException'
import { TypeDef } from '@tspring/core'
import { FactoryBean } from './FactoryBean'

export class BeanIsNotAFactoryException extends BeanNotOfRequiredTypeException {
  constructor (name: string, actualType: TypeDef) {
		super(name, FactoryBean, actualType)
	}
}
