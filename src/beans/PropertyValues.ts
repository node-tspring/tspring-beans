import { PropertyValue } from './PropertyValue'
import { Interface } from '@tspring/core'

export interface PropertyValues extends Iterable<PropertyValue> {

	iterator(): Iterator<PropertyValue>

  // spliterator(): Spliterator<PropertyValue>

	// stream(): Stream<PropertyValue>

	getPropertyValues(): PropertyValue[]

	getPropertyValue(propertyName: string ): PropertyValue | undefined

	changesSince(old: PropertyValues): PropertyValues

	contains(propertyName: string | symbol): boolean

	isEmpty(): boolean

}

export const PropertyValues = new Interface('PropertyValues')
