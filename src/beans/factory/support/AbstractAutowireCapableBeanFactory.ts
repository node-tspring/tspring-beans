import { AbstractBeanFactory } from './AbstractBeanFactory'
import { AutowireCapableBeanFactory } from '../config/AutowireCapableBeanFactory'
import { BeanDefinition } from '../config/BeanDefinition'
import { RootBeanDefinition } from './RootBeanDefinition'
import { Class, Supplier, isImplements, Implements, Interface, Method, Annotation } from '@tspring/core'
import { ConfigurableBeanFactory } from '../config/ConfigurableBeanFactory'
import { NullBean } from './NullBean'
import { BeanWrapper } from '../../BeanWrapper'
import { BeanWrapperImpl } from '../../BeanWrapperImpl'
import { BeanFactory } from '../BeanFactory'
import { BeanNameAware } from '../BeanNameAware'
import { BeanFactoryAware } from '../BeanFactoryAware'
import { Aware } from '../Aware'
import { SimpleInstantiationStrategy } from './SimpleInstantiationStrategy'
import { InstantiationStrategy } from './InstantiationStrategy'
import { MergedBeanDefinitionPostProcessor } from './MergedBeanDefinitionPostProcessor'
import { SmartInstantiationAwareBeanPostProcessor } from '../config/SmartInstantiationAwareBeanPostProcessor'
import { InstantiationAwareBeanPostProcessor } from '../config/InstantiationAwareBeanPostProcessor'
import { PropertyValues } from '../../PropertyValues'
import { MutablePropertyValues } from '../../MutablePropertyValues'
import { PropertyValue } from '../../PropertyValue'
import { TypeConverter } from '../../TypeConverter'
import { AutowiredPropertyMarker } from '../config/AutowiredPropertyMarker'
import { BeanCreationException } from '../BeanCreationException'
import { DependencyDescriptor } from '../config/DependencyDescriptor'
import { NamedBeanHolder } from '../config/NamedBeanHolder'
import { FactoryBean } from '../FactoryBean'
import { InitializingBean } from '../InitializingBean'
import { BeanDefinitionStoreException } from '../BeanDefinitionStoreException'
import { ImplicitlyAppearedSingletonException } from './ImplicitlyAppearedSingletonException'
import { BeanCurrentlyInCreationException } from '../BeanCurrentlyInCreationException'

@Implements(AutowireCapableBeanFactory)
export abstract class AbstractAutowireCapableBeanFactory extends AbstractBeanFactory implements AutowireCapableBeanFactory {
	private allowCircularReferences = true
	private factoryBeanInstanceCache = new Map<string, BeanWrapper>()
	private currentlyCreatedBean?: Object
	private instantiationStrategy = new SimpleInstantiationStrategy()

  protected abstract getBeanDefinition(beanName: string): BeanDefinition
	abstract resolveDependency(descriptor: DependencyDescriptor, requestingBeanName: string | undefined,	autowiredBeanNames?: Set<string>, typeConverter?: TypeConverter): any
	abstract resolveNamedBean<T>(requiredType: Class<T>): NamedBeanHolder<T>

  createBean<T>(beanClass: Class<T>): T
  createBean<T>(beanClass: Class<T>, autowireMode: number, dependencyCheck: boolean): T
  createBean<T> (beanClass: Class<T>, autowireMode?: number, dependencyCheck?: boolean): T {
    if (typeof autowireMode == 'number') {
			return {} as T
    } else {
      // Use prototype bean definition, to avoid registering bean as dependent bean.
      const bd = new RootBeanDefinition(beanClass)
      bd.setScope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
      // bd.allowCaching = true
      return this.$createBean(beanClass.name, bd, []) as T
    }
	}

	protected resolveBeforeInstantiation(beanName: string, mbd: RootBeanDefinition) {
		let bean
		if (mbd.beforeInstantiationResolved != false) {
			// Make sure bean class is actually resolved at this point.
			if (!mbd.isSynthetic() && this.hasInstantiationAwareBeanPostProcessors()) {
				const targetType = this.determineTargetType(beanName, mbd)
				if (targetType) {
					bean = this.applyBeanPostProcessorsBeforeInstantiation(targetType, beanName)
					if (bean != undefined) {
						bean = this.applyBeanPostProcessorsAfterInitialization(bean, beanName)
					}
				}
			}
			mbd.beforeInstantiationResolved = (bean != undefined)
		}
		return bean
	}

	protected applyBeanPostProcessorsBeforeInstantiation(beanClass: Class<Object>, beanName: string) {
		for (const bp of this.getBeanPostProcessors()) {
			if (isImplements<InstantiationAwareBeanPostProcessor>(bp, InstantiationAwareBeanPostProcessor)) {
				const ibp = bp
				const result = ibp.postProcessBeforeInstantiation(beanClass, beanName)
				if (result != undefined) {
					return result
				}
			}
		}
		return undefined
	}

  protected $createBean<T extends Object>(beanName: string, mbd: RootBeanDefinition, args: any[]) {

		console.debug(`===> Creating instance of bean '${beanName}'`)

    let mbdToUse = mbd

		// Make sure bean class is actually resolved at this point, and
		// clone the bean definition in case of a dynamically resolved Class
		// which cannot be stored in the shared merged bean definition.
		const resolvedClass = this.resolveBeanClass(mbd, beanName)

		if (resolvedClass != undefined && !mbd.hasBeanClass() && mbd.getBeanClassName()) {
			mbdToUse = new RootBeanDefinition(mbd)
			mbdToUse.setBeanClass(resolvedClass)
		}

		// Prepare method overrides.
		try {
			// mbdToUse.prepareMethodOverrides()
		} catch (ex) {
			throw new BeanDefinitionStoreException(mbdToUse.getResourceDescription(), beanName, 'Validation of method overrides failed', ex)
		}

		try {
			// Give BeanPostProcessors a chance to return a proxy instead of the target bean instance.
			const bean = this.resolveBeforeInstantiation(beanName, mbdToUse)
			if (bean != undefined) {
				return bean as T
			}
		} catch (ex) {
			throw new BeanCreationException(mbdToUse.getResourceDescription(), beanName, 'BeanPostProcessor before instantiation of bean failed', ex)
		}

		try {
			const beanInstance = this.doCreateBean(beanName, mbdToUse, args)
      console.debug(`===> Finished creating instance of bean '${beanName}'`)
			return beanInstance as T
		} catch (ex) {
			throw new BeanCreationException(mbdToUse.getResourceDescription(), beanName, 'Unexpected exception during bean creation', ex)
		}
	}

	protected obtainFromSupplier(instanceSupplier: Supplier<any> , beanName: string ): BeanWrapper {
		let instance

		const outerBean = this.currentlyCreatedBean
		this.currentlyCreatedBean = beanName
		try {
			instance = instanceSupplier.get()
		} finally {
			if (outerBean) {
				this.currentlyCreatedBean = outerBean
			}
			else {
				delete this.currentlyCreatedBean
			}
		}

		if (instance == undefined) {
			instance = new NullBean()
		}
		const bw = new BeanWrapperImpl(instance)
		this.initBeanWrapper(bw)
		return bw
	}

	protected instantiateUsingFactoryMethod(beanName: string, mbd: RootBeanDefinition, explicitArgs: any[]): BeanWrapper {
		// TODO:
		let factoryBean: Object | undefined
		let factoryClass: Class<Object>
		let isStatic: boolean

		const factoryBeanName = mbd.getFactoryBeanName()
		if (factoryBeanName != undefined) {
			if (factoryBeanName == beanName) {
				throw new BeanDefinitionStoreException(mbd.getResourceDescription(), beanName, 'factory-bean reference points back to the same bean definition')
			}
			factoryBean = this.getBean<Object>(factoryBeanName)
			if (mbd.isSingleton() && this.containsSingleton(beanName)) {
				throw new ImplicitlyAppearedSingletonException()
			}
			factoryClass = factoryBean.constructor as Class<Object>
			isStatic = false
		}
		else {
			// It's a static factory method on the bean class.
			if (!mbd.hasBeanClass()) {
				throw new BeanDefinitionStoreException(mbd.getResourceDescription(), beanName,	'bean definition declares neither a bean class nor a factory-bean reference')
			}
			factoryBean = undefined
			factoryClass = mbd.getBeanClass()
			isStatic = true
		}

		let factoryMethodToUse = undefined
		const argsToUse = explicitArgs

		if (factoryMethodToUse == undefined || argsToUse == undefined) {
			let candidateList: Method[] | undefined

			if (mbd.isFactoryMethodUnique) {
				if (factoryMethodToUse == undefined) {
					factoryMethodToUse = mbd.getResolvedFactoryMethod()
				}
				if (factoryMethodToUse != undefined) {
					candidateList = [factoryMethodToUse]
				}
			}

			if (candidateList == undefined) {
				candidateList = []
				const rawCandidates = Annotation.getAnnotationedMembers(factoryClass)
				for (const candidate of rawCandidates) {
					if (candidate instanceof Method && candidate.isStatic() == isStatic && mbd.isFactoryMethod(candidate)) {
						candidateList.push(candidate)
					}
				}
			}

			if (candidateList.length == 1 && explicitArgs.length == 0  && !mbd.hasConstructorArgumentValues()) {
				const uniqueCandidate = candidateList[0]
				if (uniqueCandidate.getParameterCount() == 0) {
					mbd.factoryMethodToIntrospect = uniqueCandidate
					// mbd.resolvedConstructorOrFactoryMethod = uniqueCandidate
					mbd.constructorArgumentsResolved = true
					// mbd.resolvedConstructorArguments = EMPTY_ARGS
					// bw.setBeanInstance(instantiate(beanName, mbd, factoryBean, uniqueCandidate, EMPTY_ARGS))
					const instance = uniqueCandidate.invoke(factoryBean, [])
					return new BeanWrapperImpl(instance)
				}
			}
		}

		throw new Error('not implement (instantiateUsingFactoryMethod)')
	}

	protected autowireConstructor(beanName: string, mbd: RootBeanDefinition, ctors: any /*Constructor<?>[]*/, explicitArgs: any[]): BeanWrapper {
		throw new Error(`${this.constructor.name}.autowireConstructor not implement!`)
	}

	protected instantiateBean(beanName: string, mbd: RootBeanDefinition): BeanWrapper {
		try {
			let parent: BeanFactory = this
			let beanInstance = this.getInstantiationStrategy().instantiate(mbd, beanName, parent)
			const bw = new BeanWrapperImpl(beanInstance)
			this.initBeanWrapper(bw)
			return bw
		} catch (ex) {
			throw new BeanCreationException(mbd.getResourceDescription(), beanName, 'Instantiation of bean failed', ex)
		}
	}

  protected createBeanInstance(beanName: string, mbd: RootBeanDefinition, args: any[]): BeanWrapper {
		const instanceSupplier = mbd.getInstanceSupplier()
		if (instanceSupplier != undefined) {
			return this.obtainFromSupplier(instanceSupplier, beanName)
		}

		if (mbd.getFactoryMethodName()) {
			return this.instantiateUsingFactoryMethod(beanName, mbd, args)
		}

		// Shortcut when re-creating the same bean...
		let resolved = false
		let autowireNecessary = false
		if (args.length == 0) {
			if (mbd.resolvedConstructorOrFactoryMethod) {
				resolved = true
				autowireNecessary = mbd.constructorArgumentsResolved
			}
		}

		if (resolved) {
			if (autowireNecessary) {
				return this.autowireConstructor(beanName, mbd, [], [])
			}
			else {
				return this.instantiateBean(beanName, mbd)
			}
		}

		// Candidate constructors for autowiring?
		// let ctors = this.determineConstructorsFromBeanPostProcessors(beanClass, beanName)
		// if (ctors != undefined || mbd.getResolvedAutowireMode() == AUTOWIRE_CONSTRUCTOR ||
		// 		mbd.hasConstructorArgumentValues() || !ObjectUtils.isEmpty(args)) {
		// 	return this.autowireConstructor(beanName, mbd, ctors, args)
		// }

		// // Preferred constructors for default construction?
		// ctors = mbd.getPreferredConstructors()
		// if (ctors != undefined) {
		// 	return this.autowireConstructor(beanName, mbd, ctors, [])
		// }

		// No special handling: simply use no-arg constructor.
		return this.instantiateBean(beanName, mbd)
	}

	protected applyMergedBeanDefinitionPostProcessors(mbd: RootBeanDefinition, beanType: Class<Object>, beanName: string) {
		for (const bp of this.getBeanPostProcessors()) {
			if (isImplements<MergedBeanDefinitionPostProcessor>(bp, MergedBeanDefinitionPostProcessor)) {
				bp.postProcessMergedBeanDefinition(mbd, beanType, beanName)
			}
		}
	}

	protected getEarlyBeanReference(beanName: string, mbd: RootBeanDefinition, bean: Object) {
		let exposedObject = bean
		if (!mbd.isSynthetic() && this.hasInstantiationAwareBeanPostProcessors()) {
			for (const bp of this.getBeanPostProcessors()) {
				if (isImplements<SmartInstantiationAwareBeanPostProcessor>(bp, SmartInstantiationAwareBeanPostProcessor)) {
					exposedObject = bp.getEarlyBeanReference(exposedObject, beanName)
				}
			}
		}
		return exposedObject
	}

	protected populateBean(beanName: string, mbd: RootBeanDefinition, bw: BeanWrapper) {
		if (bw == undefined) {
			if (mbd.hasPropertyValues()) {
				throw new BeanCreationException(mbd.getBeanClassName()!, beanName, 'Cannot apply property values to undefined instance')
			}
			else {
				// Skip property population phase for undefined instance.
				return
			}
		}

		// Give any InstantiationAwareBeanPostProcessors the opportunity to modify the
		// state of the bean before properties are set. This can be used, for example,
		// to support styles of field injection.
		let continueWithPropertyPopulation = true

		if (!mbd.isSynthetic() && this.hasInstantiationAwareBeanPostProcessors()) {
			for (const bp of this.getBeanPostProcessors()) {
				if (isImplements<InstantiationAwareBeanPostProcessor>(bp, InstantiationAwareBeanPostProcessor)) {
					if (!bp.postProcessAfterInstantiation(bw.getWrappedInstance(), beanName)) {
						continueWithPropertyPopulation = false
						break
					}
				}
			}
		}

		if (!continueWithPropertyPopulation) {
			return
		}

		let pvs: PropertyValues | undefined = (mbd.hasPropertyValues() ? mbd.getPropertyValues() : undefined)
		// const resolvedAutowireMode = mbd.getResolvedAutowireMode()
		// if (resolvedAutowireMode == AUTOWIRE_BY_NAME || resolvedAutowireMode == AUTOWIRE_BY_TYPE) {
		// 	const newPvs = new MutablePropertyValues(pvs)
		// 	// Add property values based on autowire by name if applicable.
		// 	if (resolvedAutowireMode == AUTOWIRE_BY_NAME) {
		// 		this.autowireByName(beanName, mbd, bw, newPvs)
		// 	}
		// 	// Add property values based on autowire by type if applicable.
		// 	if (resolvedAutowireMode == AUTOWIRE_BY_TYPE) {
		// 		this.autowireByType(beanName, mbd, bw, newPvs)
		// 	}
		// 	pvs = newPvs
		// }

		const hasInstAwareBpps = this.hasInstantiationAwareBeanPostProcessors()
		// const needsDepCheck = (mbd.getDependencyCheck() != AbstractBeanDefinition.DEPENDENCY_CHECK_NONE)

		// const filteredPds: PropertyDescriptor[] = []
		if (hasInstAwareBpps) {
			if (!pvs) {
				pvs = mbd.getPropertyValues()
			}
			for (const bp of this.getBeanPostProcessors()) {
				if (isImplements<InstantiationAwareBeanPostProcessor>(bp, InstantiationAwareBeanPostProcessor)) {
					let pvsToUse = bp.postProcessProperties(pvs!, bw.getWrappedInstance(), beanName)
					if (pvsToUse) {
		// 				if (!filteredPds) {
		// 					filteredPds = this.filterPropertyDescriptorsForDependencyCheck(bw, mbd.allowCaching)
		// 				}
						pvsToUse = bp.postProcessProperties(pvs!, bw.getWrappedInstance(), beanName)
						if (!pvsToUse) {
							return
						}
					}
					pvs = pvsToUse
				}
			}
		}

		// if (needsDepCheck) {
		// 	if (filteredPds == undefined) {
		// 		filteredPds = this.filterPropertyDescriptorsForDependencyCheck(bw, mbd.allowCaching)
		// 	}
		// 	this.checkDependencies(beanName, mbd, filteredPds, pvs)
		// }

		if (pvs != undefined) {
			this.applyPropertyValues(beanName, mbd, bw, pvs)
		}
	}

	private convertForProperty(value: any, propertyName: string, bw: BeanWrapper, converter: TypeConverter) {
		if (converter instanceof BeanWrapperImpl) {
			return converter.convertForProperty(value, propertyName)
		}
		else {
			// PropertyDescriptor pd = bw.getPropertyDescriptor(propertyName)
			// MethodParameter methodParam = BeanUtils.getWriteMethodParameter(pd)
			// return converter.convertIfNecessary(value, pd.getPropertyType(), methodParam)
			return converter.convertIfNecessary(value, undefined as any)
		}
	}

	protected applyPropertyValues(beanName: string, mbd: BeanDefinition, bw: BeanWrapper, pvs: PropertyValues) {
		if (pvs.isEmpty()) {
			return
		}

		let mpvs: MutablePropertyValues | undefined = undefined
		let original: PropertyValue[]

		if (pvs instanceof MutablePropertyValues) {
			mpvs = pvs
			if (mpvs.isConverted()) {
				// Shortcut: use the pre-converted values as-is.
				try {
					bw.setPropertyValues(mpvs)
					return
				} catch (ex) {
					throw new BeanCreationException(mbd.getResourceDescription(), beanName, 'Error setting property values', ex)
				}
			}
			original = mpvs.getPropertyValueList()
		}
		else {
			original = [...pvs.getPropertyValues()]
		}

		let converter = this.getCustomTypeConverter()
		if (converter == undefined) {
			converter = bw
		}
		// const valueResolver = new BeanDefinitionValueResolver(this, beanName, mbd, converter)

		// Create a deep copy, resolving any references for values.
		const deepCopy: PropertyValue[] = []
		let resolveNecessary = false
		for (const pv of original) {
			if (pv.isConverted()) {
				deepCopy.push(pv)
			}
			else {
				const propertyName = pv.getName()
				let originalValue = pv.getValue()
				if (originalValue == AutowiredPropertyMarker.SYMBOL) {
					// let writeMethod = bw.getPropertyDescriptor(propertyName).getWriteMethod()
					// if (writeMethod == undefined) {
					// 	throw new Error(`IllegalArgumentException("Autowire marker for property without write method: " + ${pv})`)
					// }
					// originalValue = new DependencyDescriptor(new MethodParameter(writeMethod, 0), true)
				}

				let resolvedValue = originalValue

				// const resolvedValue = valueResolver.resolveValueIfNecessary(pv, originalValue)
				let convertedValue = resolvedValue
				let convertible = false
				// const convertible = bw.isWritableProperty(propertyName) && !PropertyAccessorUtils.isNestedOrIndexedProperty(propertyName)
				// if (convertible) {
				// 	convertedValue = this.convertForProperty(resolvedValue, propertyName, bw, converter)
				// }
				// Possibly store converted value in merged bean definition,
				// in order to avoid re-conversion for every created bean instance.
				if (resolvedValue == originalValue) {
					if (convertible) {
						pv.setConvertedValue(convertedValue)
					}
					deepCopy.push(pv)
				}
				// TODO: 集合类型
				// else if (convertible && originalValue instanceof TypedStringValue &&
				// 		!((TypedStringValue) originalValue).isDynamic() &&
				// 		!(convertedValue instanceof Collection || ObjectUtils.isArray(convertedValue))) {
				// 	pv.setConvertedValue(convertedValue)
				// 	deepCopy.push(pv)
				// }
				// else {
				//   resolveNecessary = true
				//   deepCopy.push(new PropertyValue(pv, convertedValue))
				// }
			}
		}
		if (mpvs != undefined && !resolveNecessary) {
			mpvs.setConverted()
		}

		// Set our (possibly massaged) deep copy.
		try {
			bw.setPropertyValues(new MutablePropertyValues(deepCopy))
		}
		catch (ex) {
			throw new BeanCreationException(mbd.getResourceDescription(), beanName, 'Error setting property values', ex)
		}
	}

	private invokeAwareMethods(beanName: string, bean: Object) {
		if (isImplements<Aware>(bean, Aware)) {
			if (isImplements<BeanNameAware>(bean, BeanNameAware)) {
				bean.setBeanName(beanName)
			}
			if (isImplements<BeanFactoryAware>(bean, BeanFactoryAware)) {
				bean.setBeanFactory(this)
			}
		}
	}

	applyBeanPostProcessorsBeforeInitialization(existingBean: Object, beanName: string) {
		let result = existingBean
		for (const processor of this.getBeanPostProcessors()) {
			const current = processor.postProcessBeforeInitialization(result, beanName)
			if (current == undefined) {
				return result
			}
			result = current
		}
		return result
	}

	applyBeanPostProcessorsAfterInitialization(existingBean: Object, beanName: string) {
		let result = existingBean
		for (const processor of this.getBeanPostProcessors()) {
			const current = processor.postProcessAfterInitialization(result, beanName)
			if (current == undefined) {
				return result
			}
			result = current
		}
		return result
	}

	protected invokeCustomInitMethod(beanName: string, bean: Object, mbd: RootBeanDefinition) {

		// const initMethodName = mbd.getInitMethodName()
		// const initMethod = (mbd.isNonPublicAccessAllowed()
		// 	? BeanUtils.findMethod(bean.constructor, initMethodName)
		// 	: ClassUtils.getMethodIfAvailable(bean.constructor, initMethodName))

		// if (initMethod == undefined) {
		// 	if (mbd.isEnforceInitMethod()) {
		// 		throw new Error(`BeanDefinitionValidationException("Could not find an init method named '${initMethodName}' on bean with name '${beanName}'")`)
		// 	}
		// 	else {
		// 		console.trace("No default init method named '" + initMethodName +	"' found on bean with name '" + beanName + "'")
		// 		// Ignore non-existent default lifecycle methods.
		// 		return
		// 	}
		// }

		// console.trace("Invoking init method  '" + initMethodName + "' on bean with name '" + beanName + "'")

		// const methodToInvoke = ClassUtils.getInterfaceMethodIfPossible(initMethod)

		// try {
		// 	ReflectionUtils.makeAccessible(methodToInvoke)
		// 	methodToInvoke.invoke(bean)
		// } catch (ex) {
		// 	throw ex
		// }
	}

	protected invokeInitMethods(beanName: string, bean: Object, mbd: RootBeanDefinition) {

		if (isImplements<InitializingBean>(bean, InitializingBean) && (mbd == undefined || !mbd.isExternallyManagedInitMethod('afterPropertiesSet'))) {
			console.debug(`===> Invoking afterPropertiesSet() on bean with name '${beanName}'`)
			bean.afterPropertiesSet()
		}

		if (mbd != undefined && bean.constructor != NullBean) {
			const initMethodName = mbd.getInitMethodName()
			if (initMethodName &&	!(isImplements<InitializingBean>(bean, InitializingBean) && 'afterPropertiesSet' == initMethodName) && !mbd.isExternallyManagedInitMethod(initMethodName)) {
				this.invokeCustomInitMethod(beanName, bean, mbd)
			}
		}
	}

	protected initializeBean(beanName: string, bean: Object, mbd: RootBeanDefinition ) {
		this.invokeAwareMethods(beanName, bean)

		let wrappedBean = bean
		if (mbd == undefined || !mbd.isSynthetic()) {
			wrappedBean = this.applyBeanPostProcessorsBeforeInitialization(wrappedBean, beanName)
		}

		try {
			this.invokeInitMethods(beanName, wrappedBean, mbd)
		} catch (ex) {
			throw new BeanCreationException((mbd != undefined ? mbd.getResourceDescription() : undefined),	beanName, 'Invocation of init method failed', ex)
		}
		if (mbd == undefined || !mbd.isSynthetic()) {
			wrappedBean = this.applyBeanPostProcessorsAfterInitialization(wrappedBean, beanName)
		}

		return wrappedBean
	}

  protected doCreateBean(beanName: string, mbd: RootBeanDefinition, args: any) {
		// Instantiate the bean.
		let instanceWrapper
		if (mbd.isSingleton()) {
      instanceWrapper = this.factoryBeanInstanceCache.get(beanName)
			if (instanceWrapper) this.factoryBeanInstanceCache.delete(beanName)
		}
		if (instanceWrapper == undefined) {
			instanceWrapper = this.createBeanInstance(beanName, mbd, args)
		}
		const bean = instanceWrapper.getWrappedInstance()
		const beanType = instanceWrapper.getWrappedClass()
		if (beanType != NullBean) {
			mbd.resolvedTargetType = beanType
		}

		// Allow post-processors to modify the merged bean definition.
    if (!mbd.postProcessed) {
      try {
        this.applyMergedBeanDefinitionPostProcessors(mbd, beanType, beanName)
      } catch (ex) {
        throw new BeanCreationException(mbd.getResourceDescription(), beanName, 'Post-processing of merged bean definition failed', ex)
      }
      mbd.postProcessed = true
    }

		// Eagerly cache singletons to be able to resolve circular references
		// even when triggered by lifecycle interfaces like BeanFactoryAware.
		const earlySingletonExposure = (mbd.isSingleton() && this.allowCircularReferences && this.isSingletonCurrentlyInCreation(beanName))
		if (earlySingletonExposure) {
      console.debug(`===> Eagerly caching bean '${beanName}' to allow for resolving potential circular references`)
			this.addSingletonFactory(beanName, {
        getObject: () => this.getEarlyBeanReference(beanName, mbd, bean)
      })
		}

		// Initialize the bean instance.
		let exposedObject = bean
		try {
			this.populateBean(beanName, mbd, instanceWrapper)
			exposedObject = this.initializeBean(beanName, exposedObject, mbd)
		} catch (ex) {
			throw new BeanCreationException(mbd.getResourceDescription(), beanName, 'Initialization of bean failed', ex)
		}

		if (earlySingletonExposure) {
			const earlySingletonReference = this.$getSingleton(beanName, false)
			if (earlySingletonReference != undefined) {
				if (exposedObject == bean) {
					exposedObject = earlySingletonReference
				}
				else if (this.hasDependentBean(beanName)) {
					const dependentBeans = this.getDependentBeans(beanName)
					const actualDependentBeans = new Set<string>()
					for (const dependentBean of dependentBeans) {
						if (!this.removeSingletonIfCreatedForTypeCheckOnly(dependentBean)) {
							actualDependentBeans.add(dependentBean)
						}
					}
					if (actualDependentBeans.size > 0) {
						throw new BeanCurrentlyInCreationException(
							beanName,
							`Bean with name ${beanName} has been injected into other beans [${Array.from(actualDependentBeans).join(',')}] in its raw version as part of a circular reference, but has eventually been wrapped. This means that said other beans do not use the final version of the bean. This is often the result of over-eager type matching - consider using 'getBeanNamesOfType' with the 'allowEagerInit' flag turned off, for example.`
						)
					}
				}
			}
		}

		// Register bean as disposable.
		try {
			this.registerDisposableBeanIfNecessary(beanName, bean, mbd)
		} catch (ex) {
			throw new BeanCreationException(mbd.getResourceDescription(), beanName, 'Invalid destruction signature', ex)
		}

		return exposedObject
	}

	setInstantiationStrategy(instantiationStrategy: InstantiationStrategy) {
		this.instantiationStrategy = instantiationStrategy
	}

	protected getInstantiationStrategy() {
		return this.instantiationStrategy
	}

	protected predictBeanType(beanName: string, mbd: RootBeanDefinition, ...typesToMatch: (Class<Object>|Interface)[]) {
		const targetType = this.determineTargetType(beanName, mbd, ...typesToMatch)
		// Apply SmartInstantiationAwareBeanPostProcessors to predict the
		// eventual type after a before-instantiation shortcut.
		if (targetType != undefined && !mbd.isSynthetic() && this.hasInstantiationAwareBeanPostProcessors()) {
			const matchingOnlyFactoryBean = typesToMatch.length == 1 && typesToMatch[0] == FactoryBean
			for (const bp of this.getBeanPostProcessors()) {
				if (isImplements<SmartInstantiationAwareBeanPostProcessor>(bp, SmartInstantiationAwareBeanPostProcessor)) {
					const ibp = bp
					const predicted = ibp.predictBeanType(targetType, beanName)
					if (predicted != undefined &&
							(!matchingOnlyFactoryBean || Class.isAssignableFrom(FactoryBean, predicted))) {
						return predicted
					}
				}
			}
		}
		return targetType
	}

	protected determineTargetType(beanName: string, mbd: RootBeanDefinition, ...typesToMatch: (Class<Object>|Interface)[]) {
		let targetType = mbd.getTargetType()
		if (targetType == undefined) {
			targetType = mbd.getFactoryMethodName() != undefined
				? this.getTypeForFactoryMethod(beanName, mbd, ...typesToMatch)
				: this.resolveBeanClass(mbd, beanName, ...typesToMatch)
				mbd.resolvedTargetType = targetType
		}
		return targetType
	}

	protected getTypeForFactoryMethod(beanName: string, mbd: RootBeanDefinition, ...typesToMatch: (Class<Object>|Interface)[]) {
		let cachedReturnType = mbd.factoryMethodReturnType
		if (cachedReturnType != undefined) {
			return cachedReturnType
		}

		let commonType = undefined
		let uniqueCandidate = mbd.factoryMethodToIntrospect

		if (uniqueCandidate == undefined) {
			let factoryClass
			let isStatic = true

			const factoryBeanName = mbd.getFactoryBeanName()
			if (factoryBeanName != undefined) {
				if (factoryBeanName == beanName) {
					throw new BeanDefinitionStoreException(mbd.getResourceDescription(), beanName, 'factory-bean reference points back to the same bean definition')
				}
				// Check declared factory method return type on factory class.
				factoryClass = this.getType(factoryBeanName)
				isStatic = false
			}
			else {
				// Check declared factory method return type on bean class.
				factoryClass = this.resolveBeanClass(mbd, beanName, ...typesToMatch)
			}

			if (factoryClass == undefined) {
				return undefined
			}
			// factoryClass = ClassUtils.getUserClass(factoryClass)

			// If all factory methods have the same return type, return that type.
			// Can't clearly figure out exact method due to type converting / autowiring!
			const minNrOfArgs = 0 //	(mbd.hasConstructorArgumentValues() ? mbd.getConstructorArgumentValues().getArgumentCount() : 0)
			const candidates = Annotation.getAnnotationedMembers(factoryClass)

			for (const candidate of candidates) {
				if (!(candidate instanceof Method)) continue

				if (candidate.isStatic() == isStatic && mbd.isFactoryMethod(candidate) && candidate.getParameterCount() >= minNrOfArgs) {
					// Declared type variables to inspect?
					if (candidate.getParameterCount() > 0) {
						// try {
						// 	// Fully resolve parameter names and argument values.
						// 	Class<?>[] paramTypes = candidate.getParameterTypes()
						// 	string[] paramNames = undefined
						// 	ParameterNameDiscoverer pnd = getParameterNameDiscoverer()
						// 	if (pnd != undefined) {
						// 		paramNames = pnd.getParameterNames(candidate)
						// 	}
						// 	ConstructorArgumentValues cav = mbd.getConstructorArgumentValues()
						// 	Set<ConstructorArgumentValues.ValueHolder> usedValueHolders = new HashSet<>(paramTypes.length)
						// 	Object[] args = new Object[paramTypes.length]
						// 	for (int i = 0; i < args.length; i++) {
						// 		ConstructorArgumentValues.ValueHolder valueHolder = cav.getArgumentValue(
						// 				i, paramTypes[i], (paramNames != undefined ? paramNames[i] : undefined), usedValueHolders)
						// 		if (valueHolder == undefined) {
						// 			valueHolder = cav.getGenericArgumentValue(undefined, undefined, usedValueHolders)
						// 		}
						// 		if (valueHolder != undefined) {
						// 			args[i] = valueHolder.getValue()
						// 			usedValueHolders.add(valueHolder)
						// 		}
						// 	}
						// 	Class<?> returnType = AutowireUtils.resolveReturnTypeForFactoryMethod(
						// 			candidate, args, getBeanClassLoader())
						// 	uniqueCandidate = (commonType == undefined && returnType == candidate.getReturnType() ?
						// 			candidate : undefined)
						// 	commonType = ClassUtils.determineCommonAncestor(returnType, commonType)
						// 	if (commonType == undefined) {
						// 		// Ambiguous return types found: return undefined to indicate "not determinable".
						// 		return undefined
						// 	}
						// }
						// catch (Throwable ex) {
						// 	if (logger.isDebugEnabled()) {
						// 		logger.debug("Failed to resolve generic return type for factory method: " + ex)
						// 	}
						// }
					}
					else {
						uniqueCandidate = (commonType == undefined ? candidate : undefined)
						commonType = candidate.getReturnType() // ClassUtils.determineCommonAncestor(candidate.getReturnType(), commonType)
						if (commonType == undefined) {
							// Ambiguous return types found: return undefined to indicate "not determinable".
							return undefined
						}
					}
				}
			}

			mbd.factoryMethodToIntrospect = uniqueCandidate
			if (commonType == undefined) {
				return undefined
			}
		}

		// Common return type found: all factory methods return same type. For a non-parameterized
		// unique candidate, cache the full type declaration context of the target factory method.
		cachedReturnType = uniqueCandidate != undefined
			? uniqueCandidate.getReturnType() // ResolvableType.forMethodReturnType(uniqueCandidate)
			: commonType // ResolvableType.forClass(commonType)
		mbd.factoryMethodReturnType = cachedReturnType
		return cachedReturnType
	}
}
