import { Class, Interface } from '@tspring/core'
import { PropertyValue } from './PropertyValue'
import { PropertyValues } from './PropertyValues'

export interface PropertyAccessor {

	isReadableProperty(propertyName: string): boolean

	isWritableProperty(propertyName: string): boolean

	getPropertyType(propertyName: string): Class<Object>

	// getPropertyTypeDescriptor(propertyName: string): TypeDescriptor

	getPropertyValue(propertyName: string): any

	setPropertyValue(propertyName: string, value: any): void

	setPropertyValue(pv: PropertyValue): void

	setPropertyValues(map: Map<string, string>): void

	setPropertyValues(pvs: PropertyValues): void

	setPropertyValues(pvs: PropertyValues, ignoreUnknown: boolean): void

	setPropertyValues(pvs: PropertyValues, ignoreUnknown: boolean, ignoreInvalid: boolean): void
}

export const PropertyAccessor = new (class extends Interface{

	readonly NESTED_PROPERTY_SEPARATOR = '.'

	readonly NESTED_PROPERTY_SEPARATOR_CHAR = '.'

	readonly PROPERTY_KEY_PREFIX = '['

	readonly PROPERTY_KEY_PREFIX_CHAR = '['

	readonly PROPERTY_KEY_SUFFIX = ']'

	readonly PROPERTY_KEY_SUFFIX_CHAR = ']'

})('PropertyAccessor')
