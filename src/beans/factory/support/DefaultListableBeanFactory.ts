import { Class, isImplements, Interface, Implements, CollectionUtils } from '@tspring/core'
import { BeanDefinition } from '../config/BeanDefinition'
import { ConfigurableListableBeanFactory } from '../config/ConfigurableListableBeanFactory'
import { BeanDefinitionRegistry } from './BeanDefinitionRegistry'
import { AbstractAutowireCapableBeanFactory } from './AbstractAutowireCapableBeanFactory'
import { BeanFactory } from '../BeanFactory'
import { SmartInitializingSingleton } from '../SmartInitializingSingleton'
import { FactoryBean } from '../FactoryBean'
import { ConfigurableBeanFactory } from '../config/ConfigurableBeanFactory'
import { SmartFactoryBean } from '../SmartFactoryBean'
import { NoSuchBeanDefinitionException } from '../NoSuchBeanDefinitionException'
import { NullBean } from './NullBean'
import { RootBeanDefinition } from './RootBeanDefinition'
import { CannotLoadBeanClassException } from '../CannotLoadBeanClassException'
import { NamedBeanHolder } from '../config/NamedBeanHolder'
import { AutowireCapableBeanFactory } from '../config/AutowireCapableBeanFactory'
import { BeanDefinitionHolder } from '../config/BeanDefinitionHolder'
import { NoUniqueBeanDefinitionException } from '../NoUniqueBeanDefinitionException'
import { ObjectProvider } from '../ObjectProvider'
import { DependencyDescriptor } from '../config/DependencyDescriptor'
import { TypeConverter } from '../../TypeConverter'
import { BeanFactoryUtils } from '../BeanFactoryUtils'
import { AutowireCandidateResolver } from './AutowireCandidateResolver'
import { SimpleAutowireCandidateResolver } from './SimpleAutowireCandidateResolver'
import { BeanFactoryAware } from '../BeanFactoryAware'
import { ObjectFactory } from '../ObjectFactory'

@Implements(ConfigurableListableBeanFactory, BeanDefinitionRegistry)
export class DefaultListableBeanFactory extends AbstractAutowireCapableBeanFactory implements ConfigurableListableBeanFactory, BeanDefinitionRegistry {
	private beanDefinitionMap = new Map<string, BeanDefinition>()
	private beanDefinitionNames = new Set<string>()
	private resolvableDependencies = new Map<Class<Object>, any>()

	private allBeanNamesByType = new Map<Class<Object> | Interface, string[]>()
	private singletonBeanNamesByType = new Map<Class<Object> | Interface, string[]>()
	private manualSingletonNames = new Set<string>()
	private allowEagerClassLoading = true
	private configurationFrozen = false
	private autowireCandidateResolver: AutowireCandidateResolver = new SimpleAutowireCandidateResolver()

  containsBeanDefinition(beanName: string): boolean {
		return this.beanDefinitionMap.has(beanName)
  }

  getBean<T>(name: string): T
  getBean<T>(name: string, requiredType: Class<T>): T
  getBean<T>(name: string, requiredType: Class<T>, ...args: any[]): T
  getBean<T>(requiredType: Class<T>): T
  getBean<T>(requiredType: Class<T>, ...args: any[]): T
  getBean<T>(arg1: string | Class<T>, ...arg2: any[]): T {
    if (typeof arg1 == 'string') {
      return super.getBean(arg1, ...arg2)
    } else {
      let requiredType = arg1
      let args = arg2

      let resolved = this.resolveBean(requiredType, args, false)
      if (resolved == undefined) {
        throw new NoSuchBeanDefinitionException(requiredType.name)
      }
      return resolved
    }
	}

	protected determinePrimaryCandidate(candidates: Map<string, any>, requiredType: Class<Object>): string | undefined {
		return undefined
	}

	protected determineHighestPriorityCandidate(candidates: Map<string, any>, requiredType: Class<Object>): string | undefined {
		return undefined
	}

	private $resolveNamedBean<T extends Object>(requiredType: Class<T>, args: any[], nonUniqueAsNull: boolean): NamedBeanHolder<T> | undefined {

		let candidateNames = this.getBeanNamesForType(requiredType)

		if (candidateNames.length > 1) {
			const autowireCandidates: string[] = []
			for (const beanName of candidateNames) {
				if (!this.containsBeanDefinition(beanName) || this.getBeanDefinition(beanName).isAutowireCandidate()) {
					autowireCandidates.push(beanName)
				}
			}
			if (autowireCandidates.length > 0) {
				candidateNames = autowireCandidates
			}
		}

		if (candidateNames.length == 1) {
			const beanName = candidateNames[0]
			return new NamedBeanHolder(beanName, this.getBean(beanName, requiredType, args))
		}
		else if (candidateNames.length > 1) {
			const candidates = new Map<string, any>()
			for (const beanName of candidateNames) {
				if (this.containsSingleton(beanName) && args == undefined) {
					const beanInstance = this.getBean(beanName)
					candidates.set(beanName, (beanInstance instanceof NullBean ? undefined : beanInstance))
				}
				else {
					candidates.set(beanName, this.getType(beanName))
				}
			}
			let candidateName = this.determinePrimaryCandidate(candidates, requiredType)
			if (candidateName == undefined) {
				candidateName = this.determineHighestPriorityCandidate(candidates, requiredType)
			}
			if (candidateName != undefined) {
				let beanInstance = candidates.get(candidateName)
				if (beanInstance == undefined || Class.isClass(beanInstance)) {
					beanInstance = this.getBean(candidateName, requiredType, args)
				}
				return new NamedBeanHolder<T>(candidateName, beanInstance)
			}
			if (!nonUniqueAsNull) {
				throw new NoUniqueBeanDefinitionException(requiredType.name, candidates.keys())
			}
		}
	}

  resolveNamedBean<T>(requiredType: Class<T>): NamedBeanHolder<T>  {
		const namedBean = this.$resolveNamedBean<T>(requiredType, [], false)
		if (namedBean != undefined) {
			return namedBean
		}
		const parent = this.getParentBeanFactory()
		if (isImplements<AutowireCapableBeanFactory>(parent, AutowireCapableBeanFactory)) {
			return parent.resolveNamedBean(requiredType)
		}
		throw new NoSuchBeanDefinitionException(requiredType)
	}

  private resolveBean<T>(requiredType: Class<T>, args: any[], nonUniqueAsNull: boolean): T | undefined {
		const namedBean = this.$resolveNamedBean<T>(requiredType, args, nonUniqueAsNull)
		if (namedBean != undefined) {
			return namedBean.getBeanInstance()
		}
		const parent = this.getParentBeanFactory()
		if (parent instanceof DefaultListableBeanFactory) {
			return parent.resolveBean(requiredType, args, nonUniqueAsNull)
		}
		else if (parent != undefined) {
			const parentProvider = parent.getBeanProvider<T>(requiredType)
			if (args.length > 0) {
				return parentProvider.getObject(args)
			}
			else {
				return (nonUniqueAsNull ? parentProvider.getIfUnique() : parentProvider.getIfAvailable())
			}
		}
	}

  register (type: string, bean: Object) {
    // this.beans[type] = bean
  }

  getBeansWithAnnotation(annotationType: symbol): Map<string, any> {
    const result = new Map<string, any>()
    return result
  }

  private $isSingleton(beanName: string, mbd: RootBeanDefinition, dbd?: BeanDefinitionHolder) {
		return (dbd != undefined ? mbd.isSingleton() : this.isSingleton(beanName))
  }

  isAllowEagerClassLoading() {
		return this.allowEagerClassLoading
  }

  private requiresEagerInitForType(factoryBeanName: string ) {
		return (factoryBeanName != undefined && this.isFactoryBean(factoryBeanName) && !this.containsSingleton(factoryBeanName))
	}

  private doGetBeanNamesForType(type: Class<Object> | Interface, includeNonSingletons: boolean, allowEagerInit: boolean ) {
		const result: string[] = []

		// Check all bean definitions.
		for (let beanName of this.beanDefinitionNames) {
			// Only consider bean as eligible if the bean name
			// is not defined as alias for some other bean.
			if (!this.isAlias(beanName)) {
				try {
					const mbd = this.getMergedLocalBeanDefinition(beanName)
					// Only check bean definition if it is complete.
					if (!mbd.isAbstract() && (allowEagerInit ||
							(mbd.hasBeanClass() || !mbd.isLazyInit() || this.isAllowEagerClassLoading()) &&
									!this.requiresEagerInitForType(mbd.getFactoryBeanName()!))) {
						const isFactoryBean = this.$isFactoryBean(beanName, mbd)
						const dbd = mbd.getDecoratedDefinition()
						let matchFound = false
						const allowFactoryBeanInit = allowEagerInit || this.containsSingleton(beanName)
						const isNonLazyDecorated = dbd != undefined && !mbd.isLazyInit()
						if (!isFactoryBean) {
							if (includeNonSingletons || this.$isSingleton(beanName, mbd, dbd)) {
								matchFound = this.$isTypeMatch(beanName, type, allowFactoryBeanInit)
							}
						}
						else  {
							if (includeNonSingletons || isNonLazyDecorated ||
									(allowFactoryBeanInit && this.$isSingleton(beanName, mbd, dbd))) {
								matchFound = this.$isTypeMatch(beanName, type, allowFactoryBeanInit)
							}
							if (!matchFound) {
								// In case of FactoryBean, try to match FactoryBean instance itself next.
								beanName = BeanFactory.FACTORY_BEAN_PREFIX + beanName
								matchFound = this.$isTypeMatch(beanName, type, allowFactoryBeanInit)
							}
						}
						if (matchFound) {
							result.push(beanName)
						}
					}
				}
				catch (ex) {
					if (allowEagerInit) {
						throw ex
					}
					// Probably a placeholder: let's ignore it for type matching purposes.
          const message = (ex instanceof CannotLoadBeanClassException)
            ? `Ignoring bean class loading failure for bean '${beanName}'`
            : `Ignoring unresolvable metadata in bean definition '${beanName}'`
					console.debug(message)
					// this.onSuppressedException(ex)
				}
			}
		}

		// Check manually registered singletons too.
		for (let beanName of this.manualSingletonNames) {
			try {
				// In case of FactoryBean, match object created by FactoryBean.
				if (this.isFactoryBean(beanName)) {
					if ((includeNonSingletons || this.isSingleton(beanName)) && this.isTypeMatch(beanName, type)) {
						result.push(beanName)
						// Match found for this bean: do not match FactoryBean itself anymore.
						continue
					}
					// In case of FactoryBean, try to match FactoryBean itself next.
					beanName = BeanFactory.FACTORY_BEAN_PREFIX + beanName
				}
				// Match raw bean instance (might be raw FactoryBean).
				if (this.isTypeMatch(beanName, type)) {
					result.push(beanName)
				}
			}
			catch (ex) {
				// Shouldn't happen - probably a result of circular reference resolution...
				console.debug(`Failed to check manually registered singleton with name '${beanName}'`, ex)
			}
		}

		return result
	}

	freezeConfiguration(): void {
		this.configurationFrozen = true
	}

  isConfigurationFrozen() {
		return this.configurationFrozen
  }

  getBeanNamesForType(type: Class<Object> | Interface, includeNonSingletons: boolean = true, allowEagerInit: boolean = true) {
		if (!this.isConfigurationFrozen() || type == undefined || !allowEagerInit) {
			return this.doGetBeanNamesForType(type, includeNonSingletons, allowEagerInit)
		}
		const cache = (includeNonSingletons ? this.allBeanNamesByType : this.singletonBeanNamesByType)
		let resolvedBeanNames = cache.get(type)
		if (resolvedBeanNames != undefined) {
			return resolvedBeanNames
		}
		resolvedBeanNames = this.doGetBeanNamesForType(type, includeNonSingletons, true)
		cache.set(type, resolvedBeanNames)
		return resolvedBeanNames
	}

  getBeansOfType<T>(type: Class<T>): Map<string, T>
  getBeansOfType<T>(type: Class<T>, includeNonSingletons: boolean, allowEagerInit: boolean): Map<string, T>

  getBeansOfType<T>(type: Class<T>, includeNonSingletons?: boolean, allowEagerInit?: boolean): Map<string, T> {

    const beanNames = this.getBeanNamesForType(type, includeNonSingletons, allowEagerInit)
		const result = new Map<string, T>()
		for (const beanName of beanNames) {
			try {
				const beanInstance = this.getBean(beanName)
				if (!(beanInstance instanceof NullBean)) {
					result.set(beanName, beanInstance as T)
				}
			} catch (ex) {
				throw ex
			}
		}
    return result

  }

  registerBeanDefinition(beanName: string, beanDefinition: BeanDefinition): void {
    this.beanDefinitionMap.set(beanName, beanDefinition)
    this.beanDefinitionNames.add(beanName)
  }

	getBeanDefinitionNames() {
    return Array.from(this.beanDefinitionNames)
  }

  getBeanDefinition(beanName: string): BeanDefinition {
		const bd = this.beanDefinitionMap.get(beanName)
    if (bd == undefined) {
			console.debug(`No bean named '${beanName}' found in ${this.constructor.name}`)
			throw new NoSuchBeanDefinitionException(beanName)
		}
		return bd
  }

  isFactoryBean(name: string) {
		const beanName = this.transformedBeanName(name)
    const beanInstance = this.$getSingleton(beanName, false)

		if (beanInstance) {
			return isImplements(beanInstance , FactoryBean)
		}
		// No singleton instance found -> check bean definition.
		if (!this.containsBeanDefinition(beanName)) {
      const parentBeanFactory = this.getParentBeanFactory()
      if (isImplements<ConfigurableBeanFactory>(parentBeanFactory, ConfigurableBeanFactory)) {
			  // No bean definition found in this factory -> delegate to parent.
			  return parentBeanFactory.isFactoryBean(name)
      }
    }
		return this.$isFactoryBean(beanName, this.getMergedLocalBeanDefinition(beanName))
	}

  preInstantiateSingletons(): void {
		console.debug(`===> Pre-instantiating singletons in ${this.constructor.name}`)

		// Iterate over a copy to allow for init methods which in turn register new bean definitions.
		// While this may not be part of the regular factory bootstrap, it does otherwise work fine.
		let beanNames = Array.from(this.beanDefinitionMap.keys())

		// Trigger initialization of all non-lazy singleton beans...
		for (const beanName of beanNames) {
      const bd = this.getMergedLocalBeanDefinition(beanName)
			if (!bd.isAbstract() && bd.isSingleton() && !bd.isLazyInit()) {
				if (this.isFactoryBean(beanName)) {
					let bean = this.getBean(BeanFactory.FACTORY_BEAN_PREFIX + beanName)
					if (isImplements<SmartFactoryBean<any>>(bean, SmartFactoryBean)) {
						if (bean.isEagerInit()) {
							this.getBean(beanName)
						}
					}
				}
				else {
					this.getBean(beanName)
				}
			}
		}

		// Trigger post-initialization callback for all applicable beans...
		for (const beanName of beanNames) {
      const singletonInstance = this.getSingleton(beanName)
      console.log('singletonInstance++++', beanName, singletonInstance && singletonInstance.constructor.name)
			if (isImplements<SmartInitializingSingleton>(singletonInstance, SmartInitializingSingleton)) {
				const smartSingleton = singletonInstance
				smartSingleton.afterSingletonsInstantiated()
			}
		}
	}

	getBeanProvider<T>(requiredType: Class<T>): ObjectProvider<T> {
		return this.getBeanProvider(requiredType)
	}

	resolveDependency(descriptor: DependencyDescriptor, requestingBeanName: string | undefined, autowiredBeanNames?: Set<string>, typeConverter?: TypeConverter) {
		// descriptor.initParameterNameDiscovery(this.getParameterNameDiscoverer())
		// if (Optional == descriptor.getDependencyType()) {
		// 	return this.createOptionalDependency(descriptor, requestingBeanName)
		// }
		// else
		if (isImplements<ObjectFactory<Object>>(descriptor.getDependencyType(), ObjectFactory) ||	isImplements<ObjectProvider<Object>>(descriptor.getDependencyType(), ObjectProvider)) {
			return new this.DependencyObjectProvider(descriptor, requestingBeanName)
		}
		else {
			let result = undefined // this.getAutowireCandidateResolver().getLazyResolutionProxyIfNecessary(descriptor, requestingBeanName)
			if (result == undefined) {
				result = this.doResolveDependency(descriptor, requestingBeanName, autowiredBeanNames, typeConverter)
			}
			return result
		}
	}

	private isRequired(descriptor: DependencyDescriptor) {
		return false // this.getAutowireCandidateResolver().isRequired(descriptor)
	}

	protected findAutowireCandidates(beanName: string | undefined, requiredType: Class<Object>, descriptor: DependencyDescriptor): Map<string, any> {

		const candidateNames = BeanFactoryUtils.beanNamesForTypeIncludingAncestors(this, requiredType, true, descriptor.isEager())

		const result = new Map<string, any>()
		for (let [autowiringType, autowiringValue] of this.resolvableDependencies) {
			if (requiredType.prototype instanceof autowiringType) {
				// autowiringValue = AutowireUtils.resolveAutowiringValue(autowiringValue, requiredType)
				if (autowiringValue instanceof requiredType) {
					result.set(autowiringValue.constructor.name, autowiringValue)
					break
				}
			}
		}
		for (const candidate of candidateNames) {
			if (!this.isSelfReference(beanName, candidate) && this.isAutowireCandidate(candidate, descriptor)) {
				this.addCandidateEntry(result, candidate, descriptor, requiredType)
			}
		}
		if (result.size == 0) {
			const multiple = false // indicatesMultipleBeans(requiredType)
			// Consider fallback matches if the first pass failed to find anything...
			const fallbackDescriptor = descriptor.forFallbackMatch()
			// for (const candidate of candidateNames) {
			// 	if (!isSelfReference(beanName, candidate) && isAutowireCandidate(candidate, fallbackDescriptor) &&
			// 			(!multiple || getAutowireCandidateResolver().hasQualifier(descriptor))) {
			// 		addCandidateEntry(result, candidate, descriptor, requiredType)
			// 	}
			// }
			if (result.size == 0 && !multiple) {
				// Consider self references as a final pass...
				// but in the case of a dependency collection, not the very same bean itself.
				for (const candidate of candidateNames) {
					if (this.isSelfReference(beanName, candidate) && (!(descriptor instanceof DefaultListableBeanFactory.MultiElementDescriptor) || beanName != candidate) &&
							this.isAutowireCandidate(candidate, fallbackDescriptor)) {
						this.addCandidateEntry(result, candidate, descriptor, requiredType)
					}
				}
			}
		}
		return result
	}

	// protected $isAutowireCandidate(beanName: string, mbd: RootBeanDefinition | undefined, descriptor: DependencyDescriptor, resolver: AutowireCandidateResolver) {
	// 	return true
	// }

	isAutowireCandidate(beanName: string, descriptor: DependencyDescriptor) {
		return true // this.$isAutowireCandidate(beanName, undefined, descriptor, this.getAutowireCandidateResolver())
	}

	private isSelfReference(beanName: string | undefined, candidateName: string | undefined) {
		return (beanName != undefined && candidateName != undefined &&
				((beanName == candidateName) || (this.containsBeanDefinition(candidateName) &&
						beanName == this.getMergedLocalBeanDefinition(candidateName).getFactoryBeanName())))
	}

	private addCandidateEntry(candidates: Map<string, any>, candidateName: string, descriptor: DependencyDescriptor, requiredType: Class<Object>) {
		// if (descriptor instanceof MultiElementDescriptor) {
		// 	const beanInstance = descriptor.resolveCandidate(candidateName, requiredType, this)
		// 	if (!(beanInstance instanceof NullBean)) {
		// 		candidates.set(candidateName, beanInstance)
		// 	}
		// }
		// else if (this.containsSingleton(candidateName) || (descriptor instanceof StreamDependencyDescriptor && descriptor.isOrdered())) {
		// 	const beanInstance = descriptor.resolveCandidate(candidateName, requiredType, this)
		// 	candidates.set(candidateName, (beanInstance instanceof NullBean ? undefined : beanInstance))
		// }
		// else {
		candidates.set(candidateName, this.getType(candidateName))
		// }
	}

	setAutowireCandidateResolver(autowireCandidateResolver: AutowireCandidateResolver) {
		if (isImplements<BeanFactoryAware>(autowireCandidateResolver, BeanFactoryAware)) {
			autowireCandidateResolver.setBeanFactory(this)
		}
		this.autowireCandidateResolver = autowireCandidateResolver
	}

	getAutowireCandidateResolver() {
		return this.autowireCandidateResolver
	}

	doResolveDependency(descriptor: DependencyDescriptor, beanName: string | undefined ,
		autowiredBeanNames?: Set<string>, typeConverter?: TypeConverter) {

		// const previousInjectionPoint = ConstructorResolver.setCurrentInjectionPoint(descriptor)
		try {
			const shortcut = undefined // descriptor.resolveShortcut(this)
			if (shortcut != undefined) {
				return shortcut
			}

			const type = descriptor.getDependencyType()
			let value: any = this.getAutowireCandidateResolver().getSuggestedValue(descriptor)
			if (value != undefined) {
				if (typeof value == 'string') {
					const matches = /^\${([\w\-.]+)}$/.exec(value)
					if (matches) {
						value = this.resolveEmbeddedObject(matches[1])
					}
					else {
						const strVal = this.resolveEmbeddedValue(value)
						const bd = (beanName != undefined && this.containsBean(beanName)
							?	this.getMergedBeanDefinition(beanName)
							: undefined)
						value = this.evaluateBeanDefinitionString(strVal, bd)
					}
				}
				const converter = (typeConverter != undefined ? typeConverter : this.getTypeConverter())
				try {
					return converter.convertIfNecessary(value, type, descriptor.getTypeDescriptor())
				} catch (ex) {
					// A custom TypeConverter which does not support TypeDescriptor resolution...
					return (descriptor.getField() != undefined
						? converter.convertIfNecessary(value, type, descriptor.getField())
						: converter.convertIfNecessary(value, type, descriptor.getMethodParameter()))
				}
			}

			const multipleBeans = undefined // this.resolveMultipleBeans(descriptor, beanName, autowiredBeanNames, typeConverter)
			if (multipleBeans != undefined) {
				return multipleBeans
			}

			const matchingBeans = this.findAutowireCandidates(beanName, type, descriptor)
			if (matchingBeans.size == 0) {
				if (this.isRequired(descriptor)) {
				// 	this.raiseNoMatchingBeanFound(type, descriptor.getResolvableType(), descriptor)
				}
				return undefined
			}

			let autowiredBeanName: string | undefined
			let instanceCandidate

			if (matchingBeans.size > 1) {
				autowiredBeanName =  undefined // this.determineAutowireCandidate(matchingBeans, descriptor)
				if (autowiredBeanName == undefined) {
				// 	if (this.isRequired(descriptor) || !this.indicatesMultipleBeans(type)) {
				// 		return descriptor.resolveNotUnique(descriptor.getResolvableType(), matchingBeans)
				// 	}
				// 	else {
						return undefined
				// 	}
				}
				instanceCandidate = matchingBeans.get(autowiredBeanName)
			}
			else {
				// We have exactly one match.
				[autowiredBeanName, instanceCandidate] = matchingBeans.entries().next().value as [string, any]
			}

			if (autowiredBeanNames != undefined) {
				autowiredBeanNames.add(autowiredBeanName)
			}
			if (Class.isClass(instanceCandidate)) {
				instanceCandidate = descriptor.resolveCandidate(autowiredBeanName, type, this)
			}
			let result = instanceCandidate
			if (result instanceof NullBean) {
				if (this.isRequired(descriptor)) {
				// 	this.raiseNoMatchingBeanFound(type, descriptor.getResolvableType(), descriptor)
				}
				result = undefined
			}
			// if (!ClassUtils.isAssignableValue(type, result)) {
			// 	throw new BeanNotOfRequiredTypeException(autowiredBeanName, type, instanceCandidate.constructor)
			// }
			return result
		}
		finally {
			// ConstructorResolver.setCurrentInjectionPoint(previousInjectionPoint)
		}
	}

	private static NestedDependencyDescriptor = class NestedDependencyDescriptor extends DependencyDescriptor {
		constructor(original: DependencyDescriptor ) {
			super(original)
			// this.increaseNestingLevel()
		}
	}

	private static MultiElementDescriptor = class MultiElementDescriptor extends DefaultListableBeanFactory.NestedDependencyDescriptor {
		constructor(original: DependencyDescriptor) {
			super(original)
		}
	}

	clearMetadataCache() {
		super.clearMetadataCache()
		this.clearByTypeCache()
	}

	private clearByTypeCache() {
		this.allBeanNamesByType.clear()
		this.singletonBeanNamesByType.clear()
	}

	createOptionalDependency(descriptor: DependencyDescriptor, beanName: string | undefined, ...args: any []) {

		const descriptorToUse = new (class extends /*Nested*/DependencyDescriptor {
			isRequired() {
				return false
			}

			resolveCandidate(beanName: string , requiredType: Class<Object>, beanFactory: BeanFactory) {
				return (!CollectionUtils.isEmpty(args)
					? beanFactory.getBean(beanName, args)
					: super.resolveCandidate(beanName, requiredType, beanFactory))
			}
		})(descriptor)
		const result = this.doResolveDependency(descriptorToUse, beanName, undefined, undefined)
		return undefined //(result instanceof Optional ? result : Optional.ofNullable(result))
	}

	private DependencyObjectProvider = ((outerThis) => {
		@Implements(ObjectProvider)
		class DependencyObjectProvider implements ObjectProvider<Object> {
			private descriptor: DependencyDescriptor
			private optional: boolean
			private beanName?: string

			constructor(descriptor: DependencyDescriptor, beanName: string | undefined) {
				this.descriptor = new DependencyDescriptor(descriptor) // new NestedDependencyDescriptor(descriptor)
				this.optional = false // (this.descriptor.getDependencyType() == Optional)
				this.beanName = beanName
			}

			getObject(...args: any[]) {
				if (this.optional) {
					return outerThis.createOptionalDependency(this.descriptor, this.beanName, args)
				}
				else {
					const descriptorToUse = args.length == 0
						? this.descriptor
						: new (class extends DependencyDescriptor {
							resolveCandidate(beanName: string, requiredType: Class<Object>, beanFactory: BeanFactory ) {
								return beanFactory.getBean(beanName, args)
							}
						})(this.descriptor)

					const result = outerThis.doResolveDependency(descriptorToUse, this.beanName, undefined, undefined)
					if (result == undefined) {
						throw new NoSuchBeanDefinitionException(this.descriptor.getResolvableType() + '')
					}
					return result
				}
			}

			getIfAvailable() {
				if (this.optional) {
					return outerThis.createOptionalDependency(this.descriptor, this.beanName)
				}
				else {
					const descriptorToUse = new (class extends DependencyDescriptor {
						isRequired() {
							return false
						}
					})(this.descriptor)
					return outerThis.doResolveDependency(descriptorToUse, this.beanName, undefined, undefined)
				}
			}

			getIfUnique() {
				const descriptorToUse = new (class extends DependencyDescriptor {
					isRequired() {
						return false
					}

					resolveNotUnique(type: Class<Object>, matchingBeans: Map<string, Object>) {
						return undefined
					}
				})(this.descriptor)

				if (this.optional) {
					return outerThis.createOptionalDependency(descriptorToUse, this.beanName)
				}
				else {
					return outerThis.doResolveDependency(descriptorToUse, this.beanName, undefined, undefined)
				}
			}

			protected getValue() {
				if (this.optional) {
					return outerThis.createOptionalDependency(this.descriptor, this.beanName)
				}
				else {
					return outerThis.doResolveDependency(this.descriptor, this.beanName, undefined, undefined)
				}
			}
		}
		return DependencyObjectProvider
	})(this)
}
