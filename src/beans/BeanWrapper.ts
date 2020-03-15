import { Class, Interface } from '@tspring/core'
import { ConfigurablePropertyAccessor } from './ConfigurablePropertyAccessor'

export interface BeanWrapper extends ConfigurablePropertyAccessor {

	setAutoGrowCollectionLimit(autoGrowCollectionLimit: number): void

	getAutoGrowCollectionLimit(): number

	getWrappedInstance(): Object

	getWrappedClass(): Class<Object>

	// getPropertyDescriptors(): PropertyDescriptor[]

	// getPropertyDescriptor(propertyName: string): PropertyDescriptor

}

export const BeanWrapper = new Interface('BeanWrapper', [ConfigurablePropertyAccessor])
