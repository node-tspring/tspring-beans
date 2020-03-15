import { InjectionPoint } from '../InjectionPoint'
import { Class, Field, Annotation, MethodParameter, TypeDescriptor } from '@tspring/core'
import { BeanFactory } from '../BeanFactory'

export class DependencyDescriptor extends InjectionPoint {
	private containingClass?: Class<Object>
  private methodParameter?: MethodParameter
	private resolvableType?: Class<Object>
	private eager: boolean
	private required: boolean
	private nestingLevel = 1
  private declaringClass?: Class<Object>
  private methodName?: string | symbol
  private parameterTypes?: Class<any>[]
  private parameterIndex?: number
  private fieldName?: string | symbol
	private typeDescriptor?: TypeDescriptor

  constructor(original: DependencyDescriptor)
  constructor(methodParameter: MethodParameter, required: boolean, eager?: boolean)
  constructor(field: Field, required: boolean, eager?: boolean)

  constructor (arg1: DependencyDescriptor | Field | MethodParameter, required?: boolean, eager: boolean = true) {
    super(arg1 as any)

    if (arg1 instanceof DependencyDescriptor) {
      const original = arg1
      this.declaringClass = original.declaringClass
      this.methodName = original.methodName
      this.parameterTypes = original.parameterTypes
      this.parameterIndex = original.parameterIndex
      this.fieldName = original.fieldName
      this.containingClass = original.containingClass
      this.required = original.required
      this.eager = original.eager
      this.nestingLevel = original.nestingLevel
    }

    else if (arg1 instanceof MethodParameter) {
      this.declaringClass = arg1.getDeclaringClass()
      if (arg1.getMethod() != undefined) {
      	this.methodName = arg1.getMethod()!.getName()
      }
      this.parameterTypes = arg1.getExecutable().getParameterTypes()
      this.parameterIndex = arg1.getParameterIndex()
      this.containingClass = arg1.getContainingClass()
      this.required = required!
      this.eager = eager || true
    }

    else {
      this.declaringClass = arg1.getDeclaringClass()
      this.fieldName = arg1.getName()
      this.required = required!
      this.eager = eager || true
    }
  }

  getDependencyType(): Class<Object> {
    if (this.field != undefined) {
			if (this.nestingLevel > 1) {
				// Type type = this.field.getGenericType()
				// for (int i = 2; i <= this.nestingLevel; i++) {
				// 	if (type instanceof ParameterizedType) {
				// 		Type[] args = ((ParameterizedType) type).getActualTypeArguments()
				// 		type = args[args.length - 1]
				// 	}
				// }
				// if (type instanceof Class) {
				// 	return (Class<?>) type
				// }
				// else if (type instanceof ParameterizedType) {
				// 	Type arg = ((ParameterizedType) type).getRawType()
				// 	if (arg instanceof Class) {
				// 		return (Class<?>) arg
				// 	}
				// }
				// return Object.class
			}
			else {
				return this.field.getType()
			}
		}
		else {
			// this.obtainMethodParameter().getNestedParameterType()
    }
    return undefined as any
  }

  getTypeConverter() {
    return undefined
  }

  getTypeDescriptor() {
    let typeDescriptor = this.typeDescriptor
		if (typeDescriptor == undefined) {
			// typeDescriptor = (this.field != undefined ?
			// 		new TypeDescriptor(getResolvableType(), getDependencyType(), getAnnotations()) :
			// 		new TypeDescriptor(obtainMethodParameter()))
			this.typeDescriptor = typeDescriptor
		}
		return typeDescriptor
  }

  resolveCandidate(beanName: string, requiredType: Class<Object>, beanFactory: BeanFactory) {
    return beanFactory.getBean(beanName)
  }

  setContainingClass(containingClass: Class<Object>) {
		this.containingClass = containingClass
		this.resolvableType = undefined
		if (this.methodParameter != undefined) {
			this.methodParameter = this.methodParameter.withContainingClass(containingClass)
		}
  }

  forFallbackMatch() {
		return new ForFallbackMatchDependencyDescriptor(this)
  }

  isEager() {
		return this.eager
  }

  isRequired() {
    return this.required
  }

  getAnnotationParams<T extends Annotation.Params<Annotation.Value>>(annotation: Annotation) {
    if (this.field != undefined) {
      return this.field.getAnnotationParams<T>(annotation)
    }
    return undefined
  }

  getMethodParameter () {
    return this.methodParameter
  }

  getResolvableType() {
		let resolvableType = this.resolvableType
		if (resolvableType == undefined) {
      resolvableType = this.field != undefined
        ? this.field.getType() // ResolvableType.forField(this.field, this.nestingLevel, this.containingClass)
        : this.methodParameter!.getMethod()!.getReturnType() // ResolvableType.forMethodParameter(this.obtainMethodParameter())
			this.resolvableType = resolvableType
		}
		return resolvableType
	}
}

class ForFallbackMatchDependencyDescriptor extends DependencyDescriptor {
  fallbackMatchAllowed() {
    return true
  }
}
