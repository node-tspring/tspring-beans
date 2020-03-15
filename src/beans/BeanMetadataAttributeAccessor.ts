import { AttributeAccessorSupport, Implements } from '@tspring/core'
import { BeanMetadataElement } from './BeanMetadataElement'
import { BeanMetadataAttribute } from './BeanMetadataAttribute'

@Implements(BeanMetadataElement)
export class BeanMetadataAttributeAccessor extends AttributeAccessorSupport implements BeanMetadataElement {
  private source: any

  setSource<T>(source: T): void {
    this.source = source
  }

  getSource<T>(): T {
    return this.source
  }

  addMetadataAttribute(attribute: BeanMetadataAttribute): void {
    super.setAttribute(attribute.getName(), attribute)
  }

  getMetadataAttribute(name: string): BeanMetadataAttribute {
    return super.getAttribute(name)
  }

  setAttribute(name: string, value: any): void {
    super.setAttribute(name, new BeanMetadataAttribute(name, value))
  }

  getAttribute(name: string): any {
    const attribute = super.getAttribute(name)
    return (attribute != undefined ? attribute.getValue() : undefined)
  }

  removeAttribute(name: string): any {
    const attribute = super.removeAttribute(name)
    return (attribute != undefined ? attribute.getValue() : undefined)
  }

}
