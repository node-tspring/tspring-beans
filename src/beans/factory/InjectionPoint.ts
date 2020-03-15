import { Field } from '@tspring/core'

export class InjectionPoint {
  protected field?: Field

  constructor(field: Field)
  constructor(original: InjectionPoint)

  constructor(arg1: Field | InjectionPoint) {
    if (arg1 instanceof InjectionPoint) {
      const original = arg1
      // this.methodParameter = original.methodParameter != undefined
      //   ?	new MethodParameter(original.methodParameter)
      //   : undefined
		  // this.fieldAnnotations = original.fieldAnnotations
		  this.field = original.field
    }

    else if (arg1 instanceof Field) {
      this.field = arg1
    }
	}

  getField() {
		return this.field!
	}
}
