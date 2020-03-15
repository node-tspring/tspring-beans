import { ConfigurablePropertyAccessor } from './ConfigurablePropertyAccessor'
import { TypeConverterSupport } from './TypeConverterSupport'
import { Class, Implements } from '@tspring/core'
import { PropertyValue } from './PropertyValue'
import { PropertyValues } from './PropertyValues'
import { MutablePropertyValues } from './MutablePropertyValues'

@Implements(ConfigurablePropertyAccessor)
export abstract class AbstractPropertyAccessor extends TypeConverterSupport implements ConfigurablePropertyAccessor {
  abstract isReadableProperty(propertyName: string): boolean
  abstract isWritableProperty(propertyName: string): boolean

  abstract getPropertyValue(propertyName: string): any
  abstract setPropertyValue(propertyName: string, value: any): void
  abstract setPropertyValue(pv: PropertyValue): void

  getPropertyType(propertyName: string): Class<Object> {
    return undefined as any
  }

  setPropertyValues(map: Map<string, string>): void
  setPropertyValues(pvs: PropertyValues): void
  setPropertyValues(pvs: PropertyValues, ignoreUnknown: boolean): void
  setPropertyValues(pvs: PropertyValues, ignoreUnknown: boolean, ignoreInvalid: boolean): void
  setPropertyValues(arg1: PropertyValues | Map<string, string>, ignoreUnknown?: any, ignoreInvalid?: any) {
    if (arg1 instanceof Map) {
      this.setPropertyValues(new MutablePropertyValues(arg1))
    } else {
      const propertyValues: PropertyValue[] = arg1 instanceof MutablePropertyValues
        ? arg1.getPropertyValueList()
        : arg1.getPropertyValues()
      for (const pv of propertyValues) {
        try {
          // This method may throw any BeansException, which won't be caught
          // here, if there is a critical failure such as no matching field.
          // We can attempt to deal only with less serious exceptions.
          this.setPropertyValue(pv)
        }
        catch (ex) {
          // if (!ignoreUnknown) {
          //   throw ex
          // }
          // if (!ignoreInvalid) {
          //   throw ex
          // }
          throw ex
        }
      }
    }
  }
}
