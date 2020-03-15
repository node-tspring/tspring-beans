import { BeanMetadataAttributeAccessor } from './BeanMetadataAttributeAccessor'

export class PropertyValue extends BeanMetadataAttributeAccessor {

	private name: string

	private value: any

	private optional = false

	private converted = false

	private convertedValue: any

	private conversionNecessary = false

	private resolvedTokens: any


	constructor(original: PropertyValue)
	constructor(original: PropertyValue, value: any)
	constructor(name: string, value: any)
  constructor(arg1: PropertyValue | string, value?: any) {
    super()
    if (arg1 instanceof PropertyValue) {
      const original = arg1
      this.name = original.getName()
      if (value == undefined) {
        this.value = original.getValue()
        this.converted = original.converted
        this.convertedValue = original.convertedValue
      } else {
        this.value = value
      }
      this.optional = original.isOptional()
      this.conversionNecessary = original.conversionNecessary
      this.resolvedTokens = original.resolvedTokens
      this.setSource(original.getSource())
      this.copyAttributesFrom(original)
    }

    else {
      this.name = arg1
      this.value = value
    }
	}

	getName() {
		return this.name
	}

	getValue() {
		return this.value
	}

	getOriginalPropertyValue(): PropertyValue {
		let original:PropertyValue = this
		let source = this.getSource()
		while (source instanceof PropertyValue && source != original) {
			original = source
			source = original.getSource()
		}
		return original
	}

	setOptional(optional: boolean) {
		this.optional = optional
	}

	isOptional() {
		return this.optional
	}

	isConverted() {
		return this.converted
	}

	setConvertedValue(value: any) {
		this.converted = true
		this.convertedValue = value
	}

	getConvertedValue() {
		return this.convertedValue
	}

  equals(other: any) {
		if (this == other) {
			return true
		}
		if (!(other instanceof PropertyValue)) {
			return false
		}
		const otherPv =  other
    return (this.name == otherPv.name) &&
        (this.value == otherPv.value) &&
				(this.getSource() == otherPv.getSource())
	}

	toString() {
		return `bean property '${this.name}'`
	}

}
