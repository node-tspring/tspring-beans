import { PropertyValues } from './PropertyValues'
import { PropertyValue } from './PropertyValue'
import { Mergeable } from './Mergeable'
import { isImplements, Implements } from '@tspring/core'

@Implements(PropertyValues)
export class MutablePropertyValues implements PropertyValues {
  private propertyValueList: PropertyValue[]

	private processedProperties = new Set<string | symbol>()

  private converted = false

  constructor()
	constructor(original:PropertyValues )
	constructor(original: Map<string, any>)
  constructor(propertyValueList: PropertyValue[])
  constructor(arg1?: PropertyValues | Map<string, any> | PropertyValue[]) {
    if (!arg1) {
      this.propertyValueList = []
    }

    else if (Array.isArray(arg1)) {
      this.propertyValueList = arg1
    }

    else if (arg1 instanceof Map) {
      this.propertyValueList = []
			arg1.forEach((attrName, attrValue) => this.propertyValueList.push(new PropertyValue(attrName.toString(), attrValue)))
    }

    else {
      const pvs = arg1.getPropertyValues()
			this.propertyValueList = []
			for (const pv of pvs) {
				this.propertyValueList.push(new PropertyValue(pv))
			}
    }
  }

  [Symbol.iterator](): Iterator<PropertyValue> {
    throw new Error('Method not implemented.')
  }

  iterator(): Iterator<PropertyValue> {
    throw new Error('Method not implemented.')
  }

  getPropertyValues(): PropertyValue[] {
    return this.propertyValueList
  }

  getPropertyValue(propertyName: string): PropertyValue | undefined {
    for (const pv of this.propertyValueList) {
			if (pv.getName() == propertyName) {
				return pv
			}
		}
  }

  changesSince(old: PropertyValues): PropertyValues {
    const changes = new MutablePropertyValues()
		if (old == this) {
			return changes
		}

		// for each property value in the new set
		for (const newPv of this.propertyValueList) {
			// if there wasn't an old one, add it
			const pvOld = old.getPropertyValue(newPv.getName())
			if (pvOld == undefined || !pvOld.equals(newPv)) {
				changes.addPropertyValue(newPv)
			}
		}
		return changes
  }

  contains(propertyName: string): boolean {
    return (this.getPropertyValue(propertyName) != undefined ||
				(this.processedProperties && this.processedProperties.has(propertyName)))
  }

  isEmpty(): boolean {
    return this.propertyValueList.length == 0
  }

  setConverted() {
		this.converted = true
  }

  isConverted() {
		return this.converted
	}

  setPropertyValueAt(pv: PropertyValue, i: number) {
		this.propertyValueList[i] = pv
	}

  private mergeIfRequired(newPv: PropertyValue, currentPv: PropertyValue ): PropertyValue {
		const value = newPv.getValue()
		if (isImplements<Mergeable>(value, Mergeable)) {
			const mergeable = value
			if (mergeable.isMergeEnabled()) {
				const merged = mergeable.merge(currentPv.getValue())
				return new PropertyValue(newPv.getName(), merged)
			}
		}
		return newPv
	}

  add(propertyName: string, propertyValue: any ): MutablePropertyValues {
		this.addPropertyValue(new PropertyValue(propertyName, propertyValue))
		return this
  }

  addPropertyValue(pv: PropertyValue): MutablePropertyValues
  addPropertyValue(propertyName: string, propertyValue: any): MutablePropertyValues

  addPropertyValue(arg1: PropertyValue | string, propertyValue?: any) {
    if (typeof arg1 == 'string') {
      this.addPropertyValue(new PropertyValue(arg1, propertyValue))
    }

    else {
      let pv = arg1
      for (let i = 0; i < this.propertyValueList.length; i++) {
        const currentPv = this.propertyValueList[i]
        if (currentPv.getName() == pv.getName()) {
          pv = this.mergeIfRequired(pv, currentPv)
          this.setPropertyValueAt(pv, i)
          return this
        }
      }
      this.propertyValueList.push(pv)
    }

		return this
	}

  addPropertyValues(other: PropertyValues): MutablePropertyValues
  addPropertyValues(other: Map<string, any>): MutablePropertyValues

  addPropertyValues(arg1: PropertyValues | Map<string, any>, propertyValue?: any): MutablePropertyValues {
    if (arg1 instanceof Map) {
      arg1.forEach((attrName, attrValue) => this.addPropertyValue(new PropertyValue(attrName.toString(), attrValue)))
    }

    else {
      const pvs = arg1.getPropertyValues()
			for (const pv of pvs) {
				this.addPropertyValue(new PropertyValue(pv))
			}
    }

		return this
  }

  size() {
		return this.propertyValueList.length
	}

  getPropertyValueList() {
		return this.propertyValueList
  }

  clearProcessedProperty(propertyName: string | symbol) {
		if (this.processedProperties != undefined) {
			this.processedProperties.delete(propertyName)
		}
	}
}
