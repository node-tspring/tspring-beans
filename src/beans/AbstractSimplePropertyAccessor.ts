import { AbstractPropertyAccessor } from './AbstractPropertyAccessor'
import { Class, TypeDescriptor } from '@tspring/core'
import { PropertyValue } from './PropertyValue'
import { TypeDef } from '@tspring/core'

export abstract class AbstractSimplePropertyAccessor extends AbstractPropertyAccessor {
  private wrappedObject!: Object
	private autoGrowCollectionLimit = Number.MAX_SAFE_INTEGER

  constructor(object: Object) {
    super()
    this.setWrappedInstance(object)
  }

  setWrappedInstance(object: Object): void
	setWrappedInstance(object: Object, nestedPath: string, rootObject?: Object): void

  setWrappedInstance(object: Object, nestedPath?: string, rootObject?: Object) {
    if (typeof nestedPath == 'string') {
      this.wrappedObject = object // ObjectUtils.unwrapOptional(object)
    } else {
      this.setWrappedInstance(object, '')
    }
  }

  getWrappedInstance(): Object {
		return this.wrappedObject
  }

  getWrappedClass<T extends Object>() {
    return this.getWrappedInstance().constructor as Class<T>
  }

  setPropertyValue(propertyName: string, value: any): void
  setPropertyValue(pv: PropertyValue): void
  setPropertyValue(arg1: string | PropertyValue, value?: any) {
		let propertyName
		if (arg1 instanceof PropertyValue) {
			propertyName = arg1.getName()
			value = value == undefined ? arg1.getValue() : value
		} else {
			propertyName = arg1
		}
		(this.wrappedObject as any)[propertyName] = value
  }

  getPropertyValue(propertyName: string ) {
		return (this.wrappedObject as any)[propertyName]
	}

  isReadableProperty(propertyName: string ): boolean {
		return true
  }

  isWritableProperty(propertyName: string) {
		return true
  }

  getAutoGrowCollectionLimit(): number {
    return this.autoGrowCollectionLimit
  }

  setAutoGrowCollectionLimit(autoGrowCollectionLimit: number) {
		this.autoGrowCollectionLimit = autoGrowCollectionLimit
	}

	private $convertIfNecessary(propertyName: string, oldValue: any, newValue: any, requiredType: TypeDef, td: TypeDescriptor) {
		return oldValue
	}

	protected $convertForProperty(propertyName: string, oldValue: any, newValue: any, td: TypeDescriptor) {
		return this.$convertIfNecessary(propertyName, oldValue, newValue, td.getType()!, td)
	}
}
