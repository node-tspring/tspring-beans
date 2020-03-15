import { TypeConverterSupport } from './TypeConverterSupport'
import { TypeConverterDelegate } from './TypeConverterDelegate'

export class SimpleTypeConverter extends TypeConverterSupport {

	constructor() {
		super()
		this.typeConverterDelegate = new TypeConverterDelegate(this)
		this.registerDefaultEditors()
	}

}
