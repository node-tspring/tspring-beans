import { BeanMetadataElement } from './BeanMetadataElement'
import { Implements } from '@tspring/core'

@Implements(BeanMetadataElement)
export class BeanMetadataAttribute implements BeanMetadataElement {

	private name: string
	private value: any
	private source: any

	constructor(name: string, value: any) {
		this.name = name
		this.value = value
	}

	getName():string {
		return this.name
	}

	getValue(): any {
		return this.value
	}

	setSource( source: any): void {
		this.source = source
	}

	getSource(): any {
		return this.source
	}

	// equals(other: any): boolean  {
	// 	if (this == other) {
	// 		return true
	// 	}
	// 	if (!(other instanceof BeanMetadataAttribute)) {
	// 		return false
	// 	}
	// 	BeanMetadataAttribute otherMa = (BeanMetadataAttribute) other
	// 	return (this.name.equals(otherMa.name) &&
	// 			ObjectUtils.nullSafeEquals(this.value, otherMa.value) &&
	// 			ObjectUtils.nullSafeEquals(this.source, otherMa.source))
	// }

	// hashCode(): int {
	// 	return this.name.hashCode() * 29 + ObjectUtils.nullSafeHashCode(this.value)
	// }

	toString(): string {
		return `metadata attribute '${this.name}'`
	}

}
