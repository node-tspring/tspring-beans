import { RootBeanDefinition } from '../support/RootBeanDefinition'
import { PropertyValues } from '../../PropertyValues'
import { Class, Member, Field, Method } from '@tspring/core'
import { MutablePropertyValues } from '../../MutablePropertyValues'

type InjectedElement = InjectionMetadata.InjectedElement

export class InjectionMetadata {

	private targetClass: Class<Object>

	private injectedElements: InjectedElement[]

	private checkedElements?: InjectedElement[]

	constructor(targetClass: Class<Object>, elements: InjectedElement[]) {
		this.targetClass = targetClass
		this.injectedElements = elements
	}

	checkConfigMembers(beanDefinition: RootBeanDefinition) {
		const checkedElements: InjectedElement[] = []
		for (const element of this.injectedElements) {
		  const member = element.getMember()
			if (!beanDefinition.isExternallyManagedConfigMember(member)) {
				beanDefinition.registerExternallyManagedConfigMember(member)
				checkedElements.push(element)
				console.debug(`Registered injected element on class [${this.targetClass.name}]: ${element.toString()}`)
			}
		}
		this.checkedElements = checkedElements
	}

	inject(target: Object, beanName: string , pvs: PropertyValues ) {
		const checkedElements = this.checkedElements
		const elementsToIterate = (checkedElements != undefined ? checkedElements : this.injectedElements)
		if (elementsToIterate.length > 0) {
			for (const element of elementsToIterate) {
  			console.debug(`Processing injected element of bean '${beanName}': ${element.toString()}`)
				element.inject(target, beanName, pvs)
			}
		}
	}

	clear(pvs: PropertyValues) {
		const checkedElements = this.checkedElements
		const elementsToIterate =	(checkedElements != undefined ? checkedElements : this.injectedElements)
		if (elementsToIterate.length > 0) {
			for (const element of elementsToIterate) {
				element.clearPropertySkipping(pvs)
			}
		}
	}

	static forElements(elements: InjectedElement[], clazz: Class<Object>) {
		return (elements.length == 0 ? InjectionMetadata.EMPTY : new InjectionMetadata(clazz, elements))
	}

	static needsRefresh(metadata: InjectionMetadata | undefined, clazz: Class<Object> ) {
		return (metadata == undefined || metadata.targetClass != clazz)
	}

}

class EmptyInjectionMetadata extends InjectionMetadata {
  checkConfigMembers(beanDefinition: RootBeanDefinition) {}
  inject(target: Object, beanName: string , pvs: PropertyValues ) {}
  clear(pvs: PropertyValues) {}
}

export namespace InjectionMetadata {
  export const EMPTY = new EmptyInjectionMetadata(Object, [])
  export abstract class InjectedElement {

    protected readonly isField: boolean

    protected pd?: PropertyDescriptor

    protected skip?: boolean

    protected constructor (protected member: Member , pd: PropertyDescriptor | undefined ) {
    	this.member = member
    	this.isField = (member instanceof Field)
    	this.pd = pd
    }

    getMember() {
    	return this.member
    }

    protected getResourceType(): Class<Object> {
    	if (this.isField) {
    		return (this.member as Field).getType()
    	}
    	else {
    		return (this.member as Method).getParameterTypes()[0]
    	}
    }

    protected checkResourceType(resourceType: Class<Object>) {
    	if (this.isField) {
    		// const fieldType = (this.member as Field).getType()
    		// if (!(resourceType.isAssignableFrom(fieldType) || fieldType.isAssignableFrom(resourceType))) {
    		// 	throw new IllegalStateException("Specified field type [" + fieldType +
    		// 			"] is incompatible with resource type [" + resourceType.getName() + "]")
    		// }
    	}
    	else {
    		// const paramType = (this.member as Method).getParameterTypes()[0]
    		// if (!(resourceType.isAssignableFrom(paramType) || paramType.isAssignableFrom(resourceType))) {
    		// 	throw new IllegalStateException("Specified parameter type [" + paramType +
    		// 			"] is incompatible with resource type [" + resourceType.getName() + "]")
    		// }
    	}
    }

    inject(target: Object, requestingBeanName: string , pvs: PropertyValues) {

    	if (this.isField) {
    		const field = this.member as Field
    		field.set(target, this.getResourceToInject(target, requestingBeanName))
    	}
    	else {
    		if (this.checkPropertySkipping(pvs)) {
    			return
    		}
    		try {
    			const method = this.member as Method
    			method.invoke(target, this.getResourceToInject(target, requestingBeanName))
    		} catch (ex) {
    			throw ex
    		}
    	}
    }

    protected checkPropertySkipping(pvs: PropertyValues | undefined) {
    	let skip = this.skip
    	if (skip != undefined) {
    		return skip
    	}
    	if (pvs == undefined) {
    		this.skip = false
    		return false
    	}
      skip = this.skip
      if (skip != undefined) {
        return skip
      }
      if (this.pd != undefined) {
        if (pvs.contains(this.member.getName())) {
          // Explicit value provided as part of the bean definition.
          this.skip = true
          return true
        }
        else if (pvs instanceof MutablePropertyValues) {
          // pvs.registerProcessedProperty(this.member.getName())
        }
      }
      this.skip = false
      return false
    }

    clearPropertySkipping(pvs: PropertyValues | undefined) {
    	if (pvs == undefined) {
    		return
    	}
      if (this.skip == false && this.pd != undefined && pvs instanceof MutablePropertyValues) {
        pvs.clearProcessedProperty(this.member.getName())
      }
    }

    protected getResourceToInject(target: Object, requestingBeanName?: string ): any {
    	return undefined
    }

    toString() {
    	return `${this.constructor.name} for ${this.member}`
    }
  }
}
