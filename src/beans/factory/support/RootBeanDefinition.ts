import { AbstractBeanDefinition } from './AbstractBeanDefinition'
import { Class, Member, Method, IllegalArgumentException } from '@tspring/core'
import { BeanDefinition } from '../config/BeanDefinition'
import { BeanDefinitionHolder } from '../config/BeanDefinitionHolder'

export class RootBeanDefinition extends AbstractBeanDefinition {
  static readonly SCOPE_SINGLETON = BeanDefinition.SCOPE_SINGLETON
	private decoratedDefinition?: BeanDefinitionHolder

	resolvedTargetType?: Class<Object>
  postProcessed = false
  beforeInstantiationResolved?: boolean
	constructorArgumentsResolved = false
	targetType?: Class<Object>
  factoryMethodReturnType?: Class<Object>
  resolvedConstructorOrFactoryMethod?: () => any
  stale = false
  isFactoryBean = false
	isFactoryMethodUnique = false
	private externallyManagedInitMethods = new Set<string>()
	private externallyManagedConfigMembers?: Set<Member>
  factoryMethodToIntrospect: Method | undefined

  constructor ()
	constructor (beanClass: Class<Object>)
  constructor (original: BeanDefinition)
  constructor (original: RootBeanDefinition)
  constructor (arg1?: RootBeanDefinition | BeanDefinition | Class<Object>) {
    super(arg1 as any)
    if (arg1 instanceof RootBeanDefinition) {
      const original = arg1!
      this.decoratedDefinition = original.decoratedDefinition
      // this.qualifiedElement = original.qualifiedElement
      // this.allowCaching = original.allowCaching
      this.isFactoryMethodUnique = original.isFactoryMethodUnique
      this.targetType = original.targetType
      this.factoryMethodToIntrospect = original.factoryMethodToIntrospect
      this.factoryMethodReturnType = original.factoryMethodReturnType
    }
    else if (Class.isClass(arg1)) {
      const beanClass = arg1
      this.setBeanClass(beanClass)
    }
    else {
      const original = arg1!
    }
  }

  setDecoratedDefinition(decoratedDefinition: BeanDefinitionHolder) {
		this.decoratedDefinition = decoratedDefinition
	}

  cloneBeanDefinition(): RootBeanDefinition {
		return new RootBeanDefinition(this)
  }

  setParentName(parentName: string): void {
    if (parentName) {
			throw new IllegalArgumentException('Root bean cannot be changed into a child bean with parent reference')
		}
  }

  getParentName(): string {
    return ''
  }

  isExternallyManagedInitMethod(initMethod: string) {
    return (this.externallyManagedInitMethods != undefined && this.externallyManagedInitMethods.has(initMethod))
  }

  getDecoratedDefinition(): BeanDefinitionHolder | undefined {
		return this.decoratedDefinition
  }

  registerExternallyManagedConfigMember(configMember: Member) {
    if (this.externallyManagedConfigMembers == undefined) {
      this.externallyManagedConfigMembers = new Set<Member>()
    }
    this.externallyManagedConfigMembers.add(configMember)
  }

  isExternallyManagedConfigMember(configMember: Member) {
    return (this.externallyManagedConfigMembers != undefined &&
        this.externallyManagedConfigMembers.has(configMember))
  }

  getTargetType() {
    if (this.resolvedTargetType != undefined) {
			return this.resolvedTargetType
		}
		return this.targetType
  }

  setUniqueFactoryMethodName(name: string | symbol) {
		this.setFactoryMethodName(name)
		this.isFactoryMethodUnique = true
  }

  setNonUniqueFactoryMethodName(name: string) {
		this.setFactoryMethodName(name)
		this.isFactoryMethodUnique = false
  }

  setResolvedFactoryMethod(method: Method | undefined) {
		this.factoryMethodToIntrospect = method
  }

  getResolvedFactoryMethod() {
		return this.factoryMethodToIntrospect
  }

  getResolvableType() {
		const targetType = this.targetType
		if (targetType != undefined) {
			return targetType
		}
		const returnType = this.factoryMethodReturnType
		if (returnType != undefined) {
			return returnType
		}
		const factoryMethod = this.factoryMethodToIntrospect
		if (factoryMethod != undefined) {
			return factoryMethod.getReturnType()
		}
		return super.getResolvableType()
  }

  isFactoryMethod(candidate: Method) {
		return candidate.getName() == this.getFactoryMethodName()
	}
}
