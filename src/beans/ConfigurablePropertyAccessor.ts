import { ConversionService, Interface } from '@tspring/core'
import { PropertyAccessor } from './PropertyAccessor'
import { PropertyEditorRegistry } from './PropertyEditorRegistry'
import { TypeConverter } from './TypeConverter'

export interface ConfigurablePropertyAccessor extends PropertyAccessor, PropertyEditorRegistry, TypeConverter {
	setConversionService(conversionService: ConversionService): void
}

export const ConfigurablePropertyAccessor = new Interface(
	'ConfigurablePropertyAccessor',
	[PropertyAccessor, PropertyEditorRegistry, TypeConverter]
)
