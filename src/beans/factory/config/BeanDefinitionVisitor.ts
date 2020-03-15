import { StringValueResolver, IllegalStateException, ObjectUtils, isImplements, CollectionUtils } from '@tspring/core'
import { BeanDefinition } from './BeanDefinition'
import { MutablePropertyValues } from '../../MutablePropertyValues'
import { BeanDefinitionHolder } from './BeanDefinitionHolder'

export class BeanDefinitionVisitor {
	private valueResolver: StringValueResolver

  constructor(valueResolver: StringValueResolver) {
		this.valueResolver = valueResolver
  }

  visitBeanDefinition(beanDefinition: BeanDefinition) {
		this.visitParentName(beanDefinition)
		this.visitBeanClassName(beanDefinition)
		this.visitFactoryBeanName(beanDefinition)
		this.visitFactoryMethodName(beanDefinition)
		this.visitScope(beanDefinition)
		if (beanDefinition.hasPropertyValues()) {
			this.visitPropertyValues(beanDefinition.getPropertyValues())
		}
		if (beanDefinition.hasConstructorArgumentValues()) {
			// const cas = beanDefinition.getConstructorArgumentValues()
			// this.visitIndexedArgumentValues(cas.getIndexedArgumentValues())
			// this.visitGenericArgumentValues(cas.getGenericArgumentValues())
		}
  }

  protected visitParentName(beanDefinition: BeanDefinition) {
		const parentName = beanDefinition.getParentName()
		if (parentName != undefined) {
			const resolvedName = this.resolveStringValue(parentName)
			if (parentName != resolvedName) {
				beanDefinition.setParentName(resolvedName)
			}
		}
  }

  protected visitBeanClassName(beanDefinition: BeanDefinition) {
		const beanClassName = beanDefinition.getBeanClassName()
		if (beanClassName != undefined) {
			const resolvedName = this.resolveStringValue(beanClassName)
			if (beanClassName != resolvedName) {
				beanDefinition.setBeanClassName(resolvedName)
			}
		}
  }

  protected visitFactoryBeanName(beanDefinition: BeanDefinition) {
		const factoryBeanName = beanDefinition.getFactoryBeanName()
		if (factoryBeanName != undefined) {
			const resolvedName = this.resolveStringValue(factoryBeanName)
			if (factoryBeanName != resolvedName) {
				beanDefinition.setFactoryBeanName(resolvedName)
			}
		}
  }

  protected visitFactoryMethodName(beanDefinition: BeanDefinition) {
		const factoryMethodName = beanDefinition.getFactoryMethodName()
		if (factoryMethodName != undefined) {
			const resolvedName = this.resolveStringValue(factoryMethodName.toString())
			if (factoryMethodName != resolvedName) {
				beanDefinition.setFactoryMethodName(resolvedName)
			}
		}
  }

  protected visitScope(beanDefinition: BeanDefinition) {
		const scope = beanDefinition.getScope()
		if (scope != undefined) {
			const resolvedScope = this.resolveStringValue(scope)
			if (scope != resolvedScope) {
				beanDefinition.setScope(resolvedScope)
			}
		}
  }

  protected visitPropertyValues(pvs: MutablePropertyValues) {
		const pvArray = pvs.getPropertyValues()
		for (const pv of pvArray) {
			const newVal = this.resolveValue(pv.getValue())
			if (!ObjectUtils.nullSafeEquals(newVal, pv.getValue())) {
				pvs.add(pv.getName(), newVal)
			}
		}
  }

	protected resolveValue(value: Object | undefined) {
    if (isImplements<BeanDefinition>(value, BeanDefinition)) {
			this.visitBeanDefinition(value)
		}
		else if (value instanceof BeanDefinitionHolder) {
			this.visitBeanDefinition(value.getBeanDefinition())
		}
		// else if (value instanceof RuntimeBeanReference) {
		// 	const ref = value
		// 	const newBeanName = this.resolveStringValue(ref.getBeanName())
		// 	if (newBeanName == undefined) {
		// 		return undefined
		// 	}
		// 	if (newBeanName != ref.getBeanName()) {
		// 		return new RuntimeBeanReference(newBeanName)
		// 	}
		// }
		// else if (value instanceof RuntimeBeanNameReference) {
		// 	const ref =  value
		// 	const newBeanName = this.resolveStringValue(ref.getBeanName())
		// 	if (newBeanName == undefined) {
		// 		return undefined
		// 	}
		// 	if (newBeanName != ref.getBeanName()) {
		// 		return new RuntimeBeanNameReference(newBeanName)
		// 	}
		// }
		else if (Array.isArray(value)) {
			this.visitArray(value)
		}
		else if (value instanceof Set) {
			this.visitSet(value)
		}
		else if (value instanceof Map) {
			this.visitMap(value)
		}
		// else if (value instanceof TypedStringValue) {
		// 	const typedStringValue = value
		// 	const stringValue = typedStringValue.getValue()
		// 	if (stringValue != undefined) {
		// 		const visitedString = this.resolveStringValue(stringValue)
		// 		typedStringValue.setValue(visitedString)
		// 	}
		// }
		else if (typeof value == 'string') {
			return this.resolveStringValue(value)
		}
		return value
  }

  protected visitArray(arrayVal: any[]) {
    arrayVal.forEach((elem, index) => {
      const newVal = this.resolveValue(elem)
      if (!ObjectUtils.nullSafeEquals(newVal, elem)) {
				arrayVal[index] = newVal
			}
    })
  }

  protected visitSet(setVal: Set<any>) {
		const newContent = new Set<any>()
		let entriesModified = false
		for (const elem of setVal) {
			// const elemHash = (elem != undefined ? elem.hashCode() : 0)
			const newVal = this.resolveValue(elem)
			// const newValHash = (newVal != undefined ? newVal.hashCode() : 0)
			newContent.add(newVal)
			entriesModified = entriesModified || newVal != elem // (newVal != elem || newValHash != elemHash)
		}
		if (entriesModified) {
      setVal.clear()
      CollectionUtils.addAll(setVal, newContent)
		}
  }

  protected visitMap(mapVal: Map<Object, Object>) {
		const newContent = new Map<Object, Object>()
    let entriesModified = false
    mapVal.forEach((val, key) => {
      // const keyHash = (key != undefined ? key.hashCode() : 0)
			const newKey = this.resolveValue(key)
			// const newKeyHash = (newKey != undefined ? newKey.hashCode() : 0)
      const newVal = this.resolveValue(val)
			newContent.set(newKey!, newVal!)
			entriesModified = entriesModified || (newVal != val || newKey != key) // (newVal != val || newKey != key || newKeyHash != keyHash)
    })
		if (entriesModified) {
      mapVal.clear()
      newContent.forEach((val, key) => {
        mapVal.set(key, val)
      })
		}
	}

  protected resolveStringValue(strVal: string ) {
		if (this.valueResolver == undefined) {
			throw new IllegalStateException("No StringValueResolver specified - pass a resolver object into the constructor or override the 'resolveStringValue' method")
		}
		const resolvedValue = this.valueResolver.resolveStringValue(strVal)
		// Return original string if not modified.
		return strVal == resolvedValue ? strVal : resolvedValue
	}
}
