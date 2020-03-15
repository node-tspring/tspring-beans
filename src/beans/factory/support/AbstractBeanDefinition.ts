import { Class, Supplier, isImplements, Implements, IllegalStateException } from '@tspring/core'
import { BeanMetadataAttributeAccessor } from '../../BeanMetadataAttributeAccessor'
import { BeanDefinition } from '../config/BeanDefinition'
import { MutablePropertyValues } from '../../MutablePropertyValues'
import { BeanDefinitionDefaults } from './BeanDefinitionDefaults'

@Implements(BeanDefinition)
export abstract class AbstractBeanDefinition extends BeanMetadataAttributeAccessor implements BeanDefinition {
  private description?: string
  private beanClass?: Class<Object>
  private lazyInit = false
  private autowireCandidate = true
  private primary = false
  private beanClassName?: string
  private initMethodName?: string
  private destroyMethodName?: string
  private factoryMethodName?: string | symbol
  private scope = 'singleton'
  private abstractFlag = false
  private factoryBeanName?: string
  private instanceSupplier?: Supplier<any>
	private synthetic = false
	private propertyValues?: MutablePropertyValues

  constructor ()
  constructor (original: BeanDefinition)
  // constructor (cargs: ConstructorArgumentValues, pvs: MutablePropertyValues)
  constructor (arg1?: BeanDefinition) {
    super()
    if (isImplements<BeanDefinition>(arg1, BeanDefinition)) {
      const original = arg1
      this.setParentName(original.getParentName())
      this.setBeanClassName(original.getBeanClassName()!)
      this.setScope(original.getScope())
      this.setAbstract(original.isAbstract())
      this.setFactoryBeanName(original.getFactoryBeanName()!)
      this.setFactoryMethodName(original.getFactoryMethodName()!)
      // this.setRole(original.getRole())
      this.setSource(original.getSource())
      this.copyAttributesFrom(original)

      if (original instanceof AbstractBeanDefinition) {
        const originalAbd = original
        if (originalAbd.hasBeanClass()) {
          this.setBeanClass(originalAbd.getBeanClass())
        }
        // if (originalAbd.hasConstructorArgumentValues()) {
        //   this.setConstructorArgumentValues(new ConstructorArgumentValues(original.getConstructorArgumentValues()))
        // }
        if (originalAbd.hasPropertyValues()) {
          this.setPropertyValues(new MutablePropertyValues(original.getPropertyValues()))
        }
        // if (originalAbd.hasMethodOverrides()) {
        //   this.setMethodOverrides(new MethodOverrides(originalAbd.getMethodOverrides()))
        // }
        this.setLazyInit(originalAbd.isLazyInit())
        // this.setAutowireMode(originalAbd.getAutowireMode())
        // this.setDependencyCheck(originalAbd.getDependencyCheck())
        // this.setDependsOn(originalAbd.getDependsOn())
        this.setAutowireCandidate(originalAbd.isAutowireCandidate())
        this.setPrimary(originalAbd.isPrimary())
        // this.copyQualifiersFrom(originalAbd)
        this.setInstanceSupplier(originalAbd.getInstanceSupplier())
        // this.setNonPublicAccessAllowed(originalAbd.isNonPublicAccessAllowed())
        // this.setLenientConstructorResolution(originalAbd.isLenientConstructorResolution())
        this.setInitMethodName(originalAbd.getInitMethodName()!)
        // this.setEnforceInitMethod(originalAbd.isEnforceInitMethod())
        this.setDestroyMethodName(originalAbd.getDestroyMethodName()!)
        // this.setEnforceDestroyMethod(originalAbd.isEnforceDestroyMethod())
        this.setSynthetic(originalAbd.isSynthetic())
        // this.setResource(originalAbd.getResource())
      }
      else {
        // this.setConstructorArgumentValues(new ConstructorArgumentValues(original.getConstructorArgumentValues()))
        this.setPropertyValues(new MutablePropertyValues(original.getPropertyValues()))
        this.setLazyInit(original.isLazyInit())
        // this.setResourceDescription(original.getResourceDescription())
      }
    }
  }

  setDescription(description: string | undefined): void {
		this.description = description
  }

  getDescription(): string | undefined {
    return this.description
  }

  setResourceDescription(resourceDescription: string | undefined) {
    // this.resource = (resourceDescription != undefined ? new DescriptiveResource(resourceDescription) : undefined)
	}

  getResourceDescription(): string | undefined {
    // return (this.resource != undefined ? this.resource.getDescription() : undefined)
    return undefined
  }

  applyDefaults(defaults: BeanDefinitionDefaults) {
		const lazyInit = defaults.getLazyInit()
		if (lazyInit != undefined) {
			this.setLazyInit(lazyInit)
		}
		// this.setAutowireMode(defaults.getAutowireMode())
		// this.setDependencyCheck(defaults.getDependencyCheck())
		this.setInitMethodName(defaults.getInitMethodName())
		// this.setEnforceInitMethod(false)
		this.setDestroyMethodName(defaults.getDestroyMethodName())
		// this.setEnforceDestroyMethod(false)
	}

  setPropertyValues(propertyValues: MutablePropertyValues) {
		this.propertyValues = propertyValues
	}

  getPropertyValues(): MutablePropertyValues {
		if (this.propertyValues == undefined) {
			this.propertyValues = new MutablePropertyValues()
		}
		return this.propertyValues
	}

  overrideFrom(other: BeanDefinition) {
		if (other.getBeanClassName() != undefined) {
			this.setBeanClassName(other.getBeanClassName()!)
		}
		if (other.getScope()) {
			this.setScope(other.getScope())
		}
		this.setAbstract(other.isAbstract())
		if (other.getFactoryBeanName() != undefined) {
			this.setFactoryBeanName(other.getFactoryBeanName()!)
		}
		if (other.getFactoryMethodName() != undefined) {
			this.setFactoryMethodName(other.getFactoryMethodName()!)
		}
		// this.setRole(other.getRole())
		this.setSource(other.getSource())
		this.copyAttributesFrom(other)

		if (other instanceof AbstractBeanDefinition) {
			const otherAbd = other
			if (otherAbd.hasBeanClass()) {
				this.setBeanClass(otherAbd.getBeanClass())
			}
			// if (otherAbd.hasConstructorArgumentValues()) {
			// 	this.getConstructorArgumentValues().addArgumentValues(other.getConstructorArgumentValues())
			// }
			// if (otherAbd.hasPropertyValues()) {
			// 	this.getPropertyValues().addPropertyValues(other.getPropertyValues())
			// }
			// if (otherAbd.hasMethodOverrides()) {
			// 	this.getMethodOverrides().addOverrides(otherAbd.getMethodOverrides())
			// }
			this.setLazyInit(otherAbd.isLazyInit())
			// this.setAutowireMode(otherAbd.getAutowireMode())
			// this.setDependencyCheck(otherAbd.getDependencyCheck())
			// this.setDependsOn(otherAbd.getDependsOn())
			this.setAutowireCandidate(otherAbd.isAutowireCandidate())
			this.setPrimary(otherAbd.isPrimary())
			// this.copyQualifiersFrom(otherAbd)
			this.setInstanceSupplier(otherAbd.getInstanceSupplier())
			// this.setNonPublicAccessAllowed(otherAbd.isNonPublicAccessAllowed())
			// this.setLenientConstructorResolution(otherAbd.isLenientConstructorResolution())
			if (otherAbd.getInitMethodName() != undefined) {
				this.setInitMethodName(otherAbd.getInitMethodName()!)
				// this.setEnforceInitMethod(otherAbd.isEnforceInitMethod())
			}
			if (otherAbd.getDestroyMethodName() != undefined) {
				this.setDestroyMethodName(otherAbd.getDestroyMethodName()!)
				// this.setEnforceDestroyMethod(otherAbd.isEnforceDestroyMethod())
			}
			this.setSynthetic(otherAbd.isSynthetic())
			// this.setResource(otherAbd.getResource())
		}
		else {
			// this.getConstructorArgumentValues().addArgumentValues(other.getConstructorArgumentValues())
			// this.getPropertyValues().addPropertyValues(other.getPropertyValues())
			this.setLazyInit(other.isLazyInit())
			// this.setResourceDescription(other.getResourceDescription())
		}
	}

	abstract cloneBeanDefinition(): AbstractBeanDefinition
  abstract setParentName(parentName: string): void
  abstract getParentName(): string

  hasBeanClass() {
    return Class.isClass(this.beanClass)
  }

  setBeanClass(beanClass: Class<Object>): void {
    this.beanClass = beanClass
  }
  getBeanClass(): Class<Object> {
    if (this.beanClass == undefined) {
      throw new IllegalStateException('No bean class specified on bean definition')
    }
    return this.beanClass
  }

  setBeanClassName(beanClassName: string): void {
    this.beanClassName = beanClassName
  }

  getBeanClassName(): string | undefined {
    return this.beanClassName
  }

  setLazyInit(lazyInit: boolean): void {
    this.lazyInit = lazyInit
  }
  isLazyInit(): boolean {
    return this.lazyInit
  }

  setAutowireCandidate(autowireCandidate: boolean): void {
    this.autowireCandidate = autowireCandidate
  }
  isAutowireCandidate(): boolean {
    return this.autowireCandidate
  }

  setPrimary(primary: boolean): void {
    this.primary = primary
  }
  isPrimary(): boolean {
    return this.primary
  }

  setInitMethodName(initMethodName: string | undefined): void {
    this.initMethodName = initMethodName
  }

  getInitMethodName(): string | undefined {
    return this.initMethodName
  }

  setDestroyMethodName(destroyMethodName: string | undefined): void {
    this.destroyMethodName = destroyMethodName
  }
  getDestroyMethodName(): string | undefined {
    return this.destroyMethodName
  }

  setFactoryMethodName(factoryMethodName: string | symbol): void {
    this.factoryMethodName = factoryMethodName
  }
  getFactoryMethodName(): string | symbol | undefined {
    return this.factoryMethodName
  }

  setScope(scope: string): void {
    this.scope = scope
  }
  getScope(): string {
    return this.scope
  }

  isSingleton(): boolean {
    return this.scope === BeanDefinition.SCOPE_SINGLETON
  }
  isPrototype(): boolean {
    return this.scope === BeanDefinition.SCOPE_PROTOTYPE
  }

  setAbstract(abstractFlag: boolean) {
		this.abstractFlag = abstractFlag
	}
  isAbstract(): boolean {
    return this.abstractFlag
  }

  setFactoryBeanName(factoryBeanName: string | undefined): void {
    this.factoryBeanName = factoryBeanName
  }
  getFactoryBeanName(): string | undefined {
    return this.factoryBeanName
  }

  setInstanceSupplier(instanceSupplier?: Supplier<any>): void {
    this.instanceSupplier = instanceSupplier
  }
  getInstanceSupplier(): Supplier<any> | undefined {
    return this.instanceSupplier
  }

  setSynthetic(synthetic: boolean) {
		this.synthetic = synthetic
	}
  isSynthetic(): boolean{
		return this.synthetic
  }

  hasPropertyValues() {
    return (this.propertyValues !== undefined && !this.propertyValues.isEmpty())
  }

  getOriginatingBeanDefinition(): BeanDefinition | undefined {
    return undefined
  }

  getResolvableType() {
		return this.hasBeanClass() ? this.getBeanClass() : undefined
  }

  hasConstructorArgumentValues() {
		return false // (this.constructorArgumentValues != undefined && !this.constructorArgumentValues.isEmpty())
	}
}
