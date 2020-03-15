import { PropertyEditorRegistrySupport } from './PropertyEditorRegistrySupport'
import { TypeConverter } from './TypeConverter'
import { TypeDescriptor, Implements, Field, MethodParameter } from '@tspring/core'
import { TypeConverterDelegate } from './TypeConverterDelegate'
import { TypeDef } from '@tspring/core'

@Implements(TypeConverter)
export abstract class TypeConverterSupport extends PropertyEditorRegistrySupport implements TypeConverter {
  protected typeConverterDelegate?: TypeConverterDelegate

  convertIfNecessary<T>(value: any, requiredType?: TypeDef): T
  convertIfNecessary<T>(value: any, requiredType?: TypeDef, typeDescriptor?: TypeDescriptor): T
  convertIfNecessary<T>(value: any, requiredType?: TypeDef, methodParam?: MethodParameter): T
	convertIfNecessary<T>(value: any, requiredType?: TypeDef, field?: Field): T

  convertIfNecessary<T>(value: any, requiredType?: TypeDef, arg3?: TypeDescriptor | MethodParameter | Field): T {
    return value
  }
}
