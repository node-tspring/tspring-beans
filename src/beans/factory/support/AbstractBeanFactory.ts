import { Class, ConversionService, IllegalStateException, isImplements, Interface, Implements, StringValueResolver } from '@tspring/core'
import { ConfigurableBeanFactory } from '../config/ConfigurableBeanFactory'
import { FactoryBeanRegistrySupport } from './FactoryBeanRegistrySupport'
import { RootBeanDefinition } from './RootBeanDefinition'
import { FactoryBean } from '../FactoryBean'
import { BeanFactoryUtils } from '../BeanFactoryUtils'
import { NullBean } from './NullBean'
import { BeanDefinition } from '../config/BeanDefinition'
import { BeanFactory } from '../BeanFactory'
import { Scope } from '../config/Scope'
import { BeanWrapper } from '../../BeanWrapper'
import { ObjectProvider } from '../ObjectProvider'
import { BeanPostProcessor } from '../config/BeanPostProcessor'
import { InstantiationAwareBeanPostProcessor } from '../config/InstantiationAwareBeanPostProcessor'
import { TypeConverter } from '../../TypeConverter'
import { SimpleTypeConverter } from '../../SimpleTypeConverter'
import { BeanExpressionResolver } from '../config/BeanExpressionResolver'
import { BeanExpressionContext } from '../config/BeanExpressionContext'
import { NoSuchBeanDefinitionException } from '../NoSuchBeanDefinitionException'
import { BeanDefinitionStoreException } from '../BeanDefinitionStoreException'
import { BeanIsNotAFactoryException } from '../BeanIsNotAFactoryException'
import { BeanCurrentlyInCreationException } from '../BeanCurrentlyInCreationException'
import { BeanIsAbstractException } from '../BeanIsAbstractException'
import { CannotLoadBeanClassException } from '../CannotLoadBeanClassException'
import { BeanCreationException } from '../BeanCreationException'

@Implements(ConfigurableBeanFactory)
export abstract class AbstractBeanFactory extends FactoryBeanRegistrySupport implements ConfigurableBeanFactory {
	abstract getBeanProvider<T>(requiredType: Class<T>): ObjectProvider<T>
	protected abstract containsBeanDefinition(beanName: string): boolean
  protected abstract getBeanDefinition(beanName: string): BeanDefinition
  protected abstract $createBean<T extends Object>(beanName: string, mbd: RootBeanDefinition, args: any[]): T

	private readonly mergedBeanDefinitions = new Map<string, RootBeanDefinition>()
	private parentBeanFactory?: BeanFactory
	private cacheBeanMetadata = true
  private prototypesCurrentlyInCreation?: any
	private alreadyCreated = new Set<string>()
  private scopes = new Map<string, Scope>()
	private conversionService?: ConversionService
	private beanPostProcessors = new Set<BeanPostProcessor>()
  private mHasInstantiationAwareBeanPostProcessors = false
  private mHasDestructionAwareBeanPostProcessors = false
	private typeConverter?: TypeConverter
	private embeddedValueResolvers: StringValueResolver[] = []
	private beanExpressionResolver?: BeanExpressionResolver

	setBeanExpressionResolver(resolver: BeanExpressionResolver | undefined) {
		this.beanExpressionResolver = resolver
	}

	getBeanExpressionResolver() {
		return this.beanExpressionResolver
	}

  setTypeConverter(typeConverter: TypeConverter): void {
    this.typeConverter = typeConverter
  }

  protected getCustomTypeConverter() {
		return this.typeConverter
  }

  getTypeConverter(): TypeConverter {
    const customConverter = this.getCustomTypeConverter()
		if (customConverter != undefined) {
			return customConverter
		}
		else {
			// Build default TypeConverter, registering custom editors.
			const typeConverter = new SimpleTypeConverter()
			typeConverter.setConversionService(this.getConversionService())
			this.registerCustomEditors(typeConverter)
			return typeConverter
		}
  }

  getBeanPostProcessors() {
		return this.beanPostProcessors
  }

  protected hasInstantiationAwareBeanPostProcessors() {
		return this.mHasInstantiationAwareBeanPostProcessors
	}

	protected hasDestructionAwareBeanPostProcessors() {
		return this.mHasDestructionAwareBeanPostProcessors
  }

  addBeanPostProcessor(beanPostProcessor: BeanPostProcessor): void {
    // Remove from old position, if any

		this.beanPostProcessors.delete(beanPostProcessor)
		// Track whether it is instantiation/destruction aware
		if (isImplements<InstantiationAwareBeanPostProcessor>(beanPostProcessor, InstantiationAwareBeanPostProcessor)) {
			this.mHasInstantiationAwareBeanPostProcessors = true
		}
		// if (beanPostProcessor instanceof DestructionAwareBeanPostProcessor) {
		// 	this.mHasDestructionAwareBeanPostProcessors = true
		// }
		// Add to end of list
		this.beanPostProcessors.add(beanPostProcessor)
  }

  getBeanPostProcessorCount(): number {
    return this.beanPostProcessors.size
  }

  setCacheBeanMetadata(cacheBeanMetadata: boolean) {
		this.cacheBeanMetadata = cacheBeanMetadata
  }

  setParentBeanFactory(parentBeanFactory: BeanFactory): void {
    if (this.parentBeanFactory != undefined && this.parentBeanFactory != parentBeanFactory) {
      throw new IllegalStateException(`Already associated with parent BeanFactory: ${this.parentBeanFactory}`)
    }
    this.parentBeanFactory = parentBeanFactory
  }

  getBean<T>(name: string): T
  getBean<T>(name: string, requiredType: Class<T>): T
  getBean<T>(name: string, requiredType: Class<T>, ...args: any[]): T
  getBean<T>(name: string, ...args: any[]): T
  getBean<T>(requiredType: Class<T>): T
  getBean<T>(requiredType: Class<T>, ...args: any[]): T

  getBean<T>(arg1: string | Class<T>, ...arg2: any[]): T  {
    let name: string | undefined
    let requiredType: Class<T> | undefined
    let args: any[] = arg2
    if (typeof arg1 == 'string') {
      name = arg1
      if (arg2.length > 0) {
        if (Class.isClass<T>(arg2[0])) {
          requiredType = arg2[0]
          args.splice(0, 1)
        }
      }
    }

    else {
      requiredType = arg1
      throw Error('getBean(Class<T>, *) not implement!')
    }

    return this.doGetBean(name, requiredType, [], false)
  }

  protected transformedBeanName(name: string) {
		return this.canonicalName(BeanFactoryUtils.transformedBeanName(name))
  }

  isCacheBeanMetadata(): boolean {
    return this.cacheBeanMetadata
  }

  getParentBeanFactory() {
		return this.parentBeanFactory
	}

	containsLocalBean(name: string) {
		const beanName = this.transformedBeanName(name)
		return ((this.containsSingleton(beanName) || this.containsBeanDefinition(beanName)) &&
				(!BeanFactoryUtils.isFactoryDereference(name) || isImplements(beanName, FactoryBean)))
	}

	getMergedBeanDefinition(name: string): BeanDefinition {
    const beanName = this.transformedBeanName(name)
    // Efficiently check whether bean definition exists in this factory.
		if (!this.containsBeanDefinition(beanName)) {
      const parentBeanFactory = this.getParentBeanFactory()
      if (isImplements<ConfigurableBeanFactory>(parentBeanFactory, ConfigurableBeanFactory)) {
        return parentBeanFactory.getMergedBeanDefinition(beanName)
      }
		}
		// Resolve merged bean definition locally.
		return this.getMergedLocalBeanDefinition(beanName)
  }

  protected $getMergedBeanDefinition(beanName: string, bd: BeanDefinition, containingBd?: BeanDefinition) {
    let mbd: RootBeanDefinition | undefined
    let previous: RootBeanDefinition | undefined

    // Check with full lock now in order to enforce the same merged instance.
    if (!containingBd) {
      mbd = this.mergedBeanDefinitions.get(beanName)
    }

    if (mbd == undefined || mbd.stale) {
      previous = mbd
      mbd = undefined
      if (!bd.getParentName()) {
        // Use copy of given root bean definition.
        if (bd instanceof RootBeanDefinition) {
          mbd = bd.cloneBeanDefinition()
        }
        else {
          mbd = new RootBeanDefinition(bd)
        }
      }
      else {
        // Child bean definition: needs to be merged with parent.
        let pbd: BeanDefinition
        try {
          const parentBeanName = this.transformedBeanName(bd.getParentName())
          if (beanName != parentBeanName) {
            pbd = this.getMergedBeanDefinition(parentBeanName)
          }
          else {
            const parent = this.getParentBeanFactory()
            if (isImplements<ConfigurableBeanFactory>(parent, ConfigurableBeanFactory)) {
              pbd = parent.getMergedBeanDefinition(parentBeanName)
            }
            else {
              throw new NoSuchBeanDefinitionException(parentBeanName, `Parent name ${parentBeanName} is equal to bean name ${beanName}: cannot be resolved without an AbstractBeanFactory parent`)
            }
          }
        } catch (ex) {
          throw new BeanDefinitionStoreException(bd.getResourceDescription(), beanName, 'Could not resolve parent bean definition ${bd.getParentName()}', ex)
        }
        // Deep copy with overridden values.
        mbd = new RootBeanDefinition(pbd)
        mbd.overrideFrom(bd)
      }

      // Set default singleton scope, if not configured before.
      if (!mbd.getScope()) {
        mbd.setScope(RootBeanDefinition.SCOPE_SINGLETON)
      }

      // A bean contained in a non-singleton bean cannot be a singleton itself.
      // Let's correct this on the fly here, since this might be the result of
      // parent-child merging for the outer bean, in which case the original inner bean
      // definition will not have inherited the merged outer bean's singleton status.
      if (containingBd != undefined && !containingBd.isSingleton() && mbd.isSingleton()) {
        mbd.setScope(containingBd.getScope())
      }

      // Cache the merged bean definition for the time being
      // (it might still get re-merged later on in order to pick up metadata changes)
      if (containingBd == undefined && this.isCacheBeanMetadata()) {
        this.mergedBeanDefinitions.set(beanName, mbd)
      }
    }
    if (previous != undefined) {
      this.copyRelevantMergedBeanDefinitionCaches(previous, mbd)
    }
    return mbd
  }

  private copyRelevantMergedBeanDefinitionCaches(previous: RootBeanDefinition, mbd: RootBeanDefinition) {
		// if (ObjectUtils.nullSafeEquals(mbd.getBeanClassName(), previous.getBeanClassName()) &&
		// 		ObjectUtils.nullSafeEquals(mbd.getFactoryBeanName(), previous.getFactoryBeanName()) &&
		// 		ObjectUtils.nullSafeEquals(mbd.getFactoryMethodName(), previous.getFactoryMethodName())) {
		// 	// const targetType = mbd.targetType
		// 	// const previousTargetType = previous.targetType
		// 	if (targetType == undefined || targetType.equals(previousTargetType)) {
		// 		// mbd.targetType = previousTargetType
		// 		mbd.isFactoryBean = previous.isFactoryBean
		// 		// mbd.resolvedTargetType = previous.resolvedTargetType
		// 		// mbd.factoryMethodReturnType = previous.factoryMethodReturnType
		// 		// mbd.factoryMethodToIntrospect = previous.factoryMethodToIntrospect
		// 	}
		// }
	}

  protected getObjectForBeanInstance(beanInstance: object, name: string, beanName: string, mbd?: RootBeanDefinition) {
    // Don't let calling code try to dereference the factory if the bean isn't a factory.
    if (BeanFactoryUtils.isFactoryDereference(name)) {
      if (beanInstance instanceof NullBean) {
        return beanInstance
      }
      if (!isImplements(beanInstance, FactoryBean)) {
        throw new BeanIsNotAFactoryException(beanName, beanInstance)
      }
      if (mbd) {
        mbd.isFactoryBean = true
      }
      return beanInstance
    }

    // Now we have the bean instance, which may be a normal bean or a FactoryBean.
    // If it's a FactoryBean, we use it to create a bean instance, unless the
    // caller actually wants a reference to the factory.
    if (!isImplements<FactoryBean<any>>(beanInstance, FactoryBean)) {
      return beanInstance
    }

    let object: Object | undefined
    if (mbd) {
      mbd.isFactoryBean = true
    }
    else {
      object = this.getCachedObjectForFactoryBean(beanName)
    }
    if (object == undefined) {
      // Return bean instance from factory.
      const factory = beanInstance
      // Caches object obtained from FactoryBean if it is a singleton.
      if (mbd == undefined && this.containsBeanDefinition(beanName)) {
        mbd = this.getMergedLocalBeanDefinition(beanName)
      }
      const synthetic = (mbd != undefined && mbd.isSynthetic())
      object = this.getObjectFromFactoryBean(factory, beanName, !synthetic)
    }
    return object
  }

  protected getMergedLocalBeanDefinition(beanName: string) {
		// Quick check on the concurrent map first, with minimal locking.
		const mbd = this.mergedBeanDefinitions.get(beanName)
		if (mbd != undefined && !mbd.stale) {
			return mbd
    }
		return this.$getMergedBeanDefinition(beanName, this.getBeanDefinition(beanName))
  }

  protected isPrototypeCurrentlyInCreation(beanName: string) {
		const curVal = this.prototypesCurrentlyInCreation
		return (curVal != undefined &&
				(curVal == beanName || (curVal instanceof Set && curVal.has(beanName))))
	}

  protected clearMergedBeanDefinition(beanName: string) {
		const bd = this.mergedBeanDefinitions.get(beanName)
		if (bd != undefined) {
			bd.stale = true
		}
  }

  protected markBeanAsCreated(beanName: string) {
		if (!this.alreadyCreated.has(beanName)) {
      if (!this.alreadyCreated.has(beanName)) {
        // Let the bean definition get re-merged now that we're actually creating
        // the bean... just in case some of its metadata changed in the meantime.
        this.clearMergedBeanDefinition(beanName)
        this.alreadyCreated.add(beanName)
      }
		}
  }

  protected checkMergedBeanDefinition(mbd: RootBeanDefinition, beanName: string, args: any[]) {
		if (mbd.isAbstract()) {
			throw new BeanIsAbstractException(beanName)
		}
	}

  protected doGetBean<T>(name: string, requiredType: Class<T> | undefined, args: any[], typeCheckOnly: boolean): T {

    const beanName = this.transformedBeanName(name)
    let bean: Object

    // Eagerly check singleton cache for manually registered singletons.
    let sharedInstance = this.getSingleton(beanName)
    if (sharedInstance != undefined && args.length == 0) {
      if (this.isSingletonCurrentlyInCreation(beanName)) {
        console.debug(`Returning eagerly cached instance of singleton bean '${beanName}' that is not fully initialized yet - a consequence of a circular reference`)
      }

      else {
        console.debug(`Returning cached instance of singleton bean '${beanName}'`)
      }
      bean = this.getObjectForBeanInstance(sharedInstance, name, beanName)
    }

    else {
      // Fail if we're already creating this bean instance:
      // We're assumably within a circular reference.
      if (this.isPrototypeCurrentlyInCreation(beanName)) {
        throw new BeanCurrentlyInCreationException(beanName)
      }

      // Check if bean definition exists in this factory.
      // BeanFactory parentBeanFactory = getParentBeanFactory()
      // if (parentBeanFactory != undefined && !containsBeanDefinition(beanName)) {
      //   // Not found -> check parent.
      //   string nameToLookup = originalBeanName(name)
      //   if (parentBeanFactory instanceof AbstractBeanFactory) {
      //     return ((AbstractBeanFactory) parentBeanFactory).doGetBean(
      //         nameToLookup, requiredType, args, typeCheckOnly)
      //   }
      //   else if (args.length > 0) {
      //     // Delegation to parent with explicit args.
      //     return (T) parentBeanFactory.getBean(nameToLookup, args)
      //   }
      //   else if (requiredType != undefined) {
      //     // No args -> delegate to standard getBean method.
      //     return parentBeanFactory.getBean(nameToLookup, requiredType)
      //   }
      //   else {
      //     return (T) parentBeanFactory.getBean(nameToLookup)
      //   }
      // }

      if (!typeCheckOnly) {
        this.markBeanAsCreated(beanName)
      }

      try {
        const mbd = this.getMergedLocalBeanDefinition(beanName)
        this.checkMergedBeanDefinition(mbd, beanName, args)

        // Guarantee initialization of beans that the current bean depends on.
        // string[] dependsOn = mbd.getDependsOn()
        // if (dependsOn != undefined) {
        //   for (string dep : dependsOn) {
        //     if (isDependent(beanName, dep)) {
        //       throw new BeanCreationException(mbd.getResourceDescription(), beanName,
        //           "Circular depends-on relationship between '" + beanName + "' and '" + dep + "'")
        //     }
        //     registerDependentBean(dep, beanName)
        //     try {
        //       getBean(dep)
        //     }
        //     catch (NoSuchBeanDefinitionException ex) {
        //       throw new BeanCreationException(mbd.getResourceDescription(), beanName,
        //           "'" + beanName + "' depends on missing bean '" + dep + "'", ex)
        //     }
        //   }
        // }

        // Create bean instance.
        if (mbd.isSingleton()) {
          sharedInstance = this.getSingleton(beanName, {
            getObject: () => {
              try {
                return this.$createBean(beanName, mbd, args)
              } catch (ex) {
                // Explicitly remove instance from singleton cache: It might have been put there
                // eagerly by the creation process, to allow for circular reference resolution.
                // Also remove any beans that received a temporary reference to the bean.
                this.destroySingleton(beanName)
                throw ex
              }
            }
          })
          bean = this.getObjectForBeanInstance(sharedInstance, name, beanName, mbd)
        }

        else if (mbd.isPrototype()) {
          // It's a prototype -> create a new instance.
          let prototypeInstance: Object
          try {
            this.beforePrototypeCreation(beanName)
            prototypeInstance = this.$createBean(beanName, mbd, args)
          }
          finally {
            this.afterPrototypeCreation(beanName)
          }
          bean = this.getObjectForBeanInstance(prototypeInstance, name, beanName, mbd)
        }

        else {
          const scopeName = mbd.getScope()
          const scope = this.scopes.get(scopeName)
          if (scope == undefined) {
            throw new Error(`No Scope registered for scope name '${scopeName}'`)
          }
          try {
            const scopedInstance = scope.get(beanName, {
              getObject: () => {
                this.beforePrototypeCreation(beanName)
                try {
                  return this.$createBean(beanName, mbd, args)
                } finally {
                  this.afterPrototypeCreation(beanName)
                }
              }
            })
            bean = this.getObjectForBeanInstance(scopedInstance, name, beanName, mbd)
          } catch (ex) {
            throw new BeanCreationException(beanName, `Scope '${scopeName}' is not active for the current thread consider defining a scoped proxy for this bean if you intend to refer to it from a singleton`, ex)
          }
        }
      } catch (ex) {
        this.cleanupAfterBeanCreationFailure(beanName)
        throw ex
      }
    }

    // Check if required type matches the type of the actual bean instance.
    // if (requiredType != undefined && !requiredType.isInstance(bean)) {
    //   try {
    //     const convertedBean = this.getTypeConverter().convertIfNecessary(bean, requiredType)
    //     if (convertedBean == undefined) {
    //       throw new BeanNotOfRequiredTypeException(name, requiredType, (bean as any).constructor)
    //     }
    //     return convertedBean
    //   } catch (ex) {
    //     console.trace("Failed to convert bean '" + name + "' to required type '" + requiredType + "'", ex)
    //     throw new BeanNotOfRequiredTypeException(name, requiredType, (bean as any).constructor)
    //   }
    // }
    return bean as T
  }

  protected beforePrototypeCreation(beanName: string) {
		const curVal = this.prototypesCurrentlyInCreation
		if (curVal == undefined) {
			this.prototypesCurrentlyInCreation.set(beanName)
		}
		else if (typeof curVal == 'string') {
			const beanNameSet = new Set<string>()
			beanNameSet.add(curVal)
			beanNameSet.add(beanName)
			this.prototypesCurrentlyInCreation.set(beanNameSet)
		}
		else {
			const beanNameSet = curVal
			beanNameSet.add(beanName)
		}
  }

  protected afterPrototypeCreation(beanName: string) {
		const curVal = this.prototypesCurrentlyInCreation
		if (typeof curVal == 'string') {
			delete this.prototypesCurrentlyInCreation
		}
		else if (curVal instanceof Set) {
			const beanNameSet = curVal
			beanNameSet.delete(beanName)
			if (beanNameSet.size == 0) {
				delete this.prototypesCurrentlyInCreation
			}
		}
  }

  protected cleanupAfterBeanCreationFailure(beanName: string) {
    this.alreadyCreated.delete(beanName)
  }

  protected resolveBeanClass(mbd: RootBeanDefinition, beanName: string, ...typesToMatch: (Class<Object>|Interface)[]) {

		try {
			if (mbd.hasBeanClass()) {
				return mbd.getBeanClass()
			}
			return this.doResolveBeanClass(mbd, ...typesToMatch)
		} catch (err) {
			throw new CannotLoadBeanClassException(mbd.getResourceDescription(), beanName, mbd.getBeanClassName(), err)
		}
  }

  private doResolveBeanClass(mbd: RootBeanDefinition, ...typesToMatch: (Class<Object>|Interface)[]): Class<Object> | undefined {

		let className = mbd.getBeanClassName()
		if (className != undefined) {
			const evaluated = this.evaluateBeanDefinitionString(className, mbd)
			if (className != evaluated) {
				if (Class.isClass(evaluated)) {
					return evaluated
				}
				else if (typeof evaluated == 'string') {
					className = evaluated
				}
				else {
					throw new IllegalStateException(`Invalid class name expression result: ${evaluated}`)
				}
			}
		}
		return mbd.hasBeanClass() ? mbd.getBeanClass() : undefined
	}

	addEmbeddedValueResolver(valueResolver: StringValueResolver): void {
		this.embeddedValueResolvers.push(valueResolver)
	}

	hasEmbeddedValueResolver(): boolean {
		return this.embeddedValueResolvers.length > 0
	}

	resolveEmbeddedValue(value: string | undefined) {
		if (value == undefined) {
			return undefined
		}
		let result: string | undefined = value
		for (const resolver of this.embeddedValueResolvers) {
			result = resolver.resolveStringValue(value)
			if (result == undefined) {
				return undefined
			}
		}
		return result
	}

	resolveEmbeddedObject(value: string | undefined) {
		if (value == undefined) {
			return undefined
		}
		let result: any = value
		for (const resolver of this.embeddedValueResolvers) {
			result = resolver.resolveObjectValue(value)
			if (result == undefined) {
				return undefined
			}
		}
		return result
	}

  // 表达式解析
  protected evaluateBeanDefinitionString(value: string | undefined, beanDefinition?: BeanDefinition): any {
		if (!this.beanExpressionResolver) {
			return value
		}

		let scope = undefined
		if (beanDefinition) {
			const scopeName = beanDefinition.getScope()
			if (scopeName) {
				// scope = this.getRegisteredScope(scopeName)
			}
		}
		return this.beanExpressionResolver.evaluate(value, new BeanExpressionContext(this, scope))
  }

  setConversionService(conversionService: ConversionService): void {
    this.conversionService = conversionService
  }

  getConversionService(): ConversionService | undefined {
    return this.conversionService
  }

  protected registerCustomEditors(registry: any /*PropertyEditorRegistry*/) {
		// PropertyEditorRegistrySupport registrySupport =
		// 		(registry instanceof PropertyEditorRegistrySupport ? (PropertyEditorRegistrySupport) registry : undefined)
		// if (registrySupport != undefined) {
		// 	registrySupport.useConfigValueEditors()
		// }
		// if (!this.propertyEditorRegistrars.isEmpty()) {
		// 	for (PropertyEditorRegistrar registrar : this.propertyEditorRegistrars) {
		// 		try {
		// 			registrar.registerCustomEditors(registry)
		// 		}
		// 		catch (BeanCreationException ex) {
		// 			Throwable rootCause = ex.getMostSpecificCause()
		// 			if (rootCause instanceof BeanCurrentlyInCreationException) {
		// 				BeanCreationException bce = (BeanCreationException) rootCause
		// 				string bceBeanName = bce.getBeanName()
		// 				if (bceBeanName != undefined && isCurrentlyInCreation(bceBeanName)) {
		// 					if (logger.isDebugEnabled()) {
		// 						logger.debug("===> PropertyEditorRegistrar [" + registrar.constructor.name +
		// 								"] failed because it tried to obtain currently created bean '" +
		// 								ex.getBeanName() + "': " + ex.getMessage())
		// 					}
		// 					onSuppressedException(ex)
		// 					continue
		// 				}
		// 			}
		// 			throw ex
		// 		}
		// 	}
		// }
		// if (!this.customEditors.isEmpty()) {
		// 	this.customEditors.forEach((requiredType, editorClass) ->
		// 			registry.registerCustomEditor(requiredType, BeanUtils.instantiateClass(editorClass)))
		// }
	}

  protected initBeanWrapper(bw: BeanWrapper) {
		bw.setConversionService(this.getConversionService()!)
		this.registerCustomEditors(bw)
  }

  protected registerDisposableBeanIfNecessary(beanName: string, bean: Object, mbd: RootBeanDefinition) {
		// const acc = undefined
		// if (!mbd.isPrototype() && this.requiresDestruction(bean, mbd)) {
		// 	if (mbd.isSingleton()) {
		// 		// Register a DisposableBean implementation that performs all destruction
		// 		// work for the given bean: DestructionAwareBeanPostProcessors,
		// 		// DisposableBean interface, custom destroy method.
		// 		this.registerDisposableBean(beanName,	new DisposableBeanAdapter(bean, beanName, mbd, this.getBeanPostProcessors()))
		// 	}
		// 	else {
		// 		// A bean with a custom scope...
		// 		const scope = this.scopes.get(mbd.getScope())
		// 		if (scope == undefined) {
		// 			throw new IllegalStateException(`No Scope registered for scope name '${mbd.getScope()}'`)
		// 		}
		// 		scope.registerDestructionCallback(beanName,	new DisposableBeanAdapter(bean, beanName, mbd, this.getBeanPostProcessors()))
		// 	}
		// }
  }

  protected removeSingletonIfCreatedForTypeCheckOnly(beanName: string) {
		if (!this.alreadyCreated.has(beanName)) {
			this.removeSingleton(beanName)
			return true
		}
		else {
			return false
		}
  }


  protected $isFactoryBean(beanName: string, mbd: RootBeanDefinition) {
		let result = mbd.isFactoryBean
		if (result == undefined) {
			const beanType = this.predictBeanType(beanName, mbd, FactoryBean)
			result = (beanType != undefined && Class.isAssignableFrom(FactoryBean, beanType))
      mbd.isFactoryBean = result
		}
		return result
  }

  isFactoryBean(name: string) {
		const beanName = this.transformedBeanName(name)
		let beanInstance = this.$getSingleton(beanName, false)
		if (beanInstance != undefined) {
			return isImplements<FactoryBean<any>>(beanInstance, FactoryBean)
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

  protected originalBeanName(name: string) {
		let beanName = this.transformedBeanName(name)
		if (name.startsWith(BeanFactory.FACTORY_BEAN_PREFIX)) {
			beanName = BeanFactory.FACTORY_BEAN_PREFIX + beanName
		}
		return beanName
	}

  isSingleton(name: string) {
		const beanName = this.transformedBeanName(name)

		const beanInstance = this.$getSingleton(beanName, false)
		if (beanInstance != undefined) {
			if (isImplements<FactoryBean<any>>(beanInstance, FactoryBean) ) {
				return (BeanFactoryUtils.isFactoryDereference(name) || beanInstance.isSingleton())
			}
			else {
				return !BeanFactoryUtils.isFactoryDereference(name)
			}
		}

		// No singleton instance found -> check bean definition.
		const parentBeanFactory = this.getParentBeanFactory()
		if (parentBeanFactory != undefined && !this.containsBeanDefinition(beanName)) {
			// No bean definition found in this factory -> delegate to parent.
			return parentBeanFactory.isSingleton(this.originalBeanName(name))
		}

		const mbd = this.getMergedLocalBeanDefinition(beanName)

		// In case of FactoryBean, return singleton status of created object if not a dereference.
		if (mbd.isSingleton()) {
			if (this.$isFactoryBean(beanName, mbd)) {
				if (BeanFactoryUtils.isFactoryDereference(name)) {
					return true
				}
				const factoryBean: FactoryBean<any> = this.getBean(BeanFactory.FACTORY_BEAN_PREFIX + beanName)
				return factoryBean.isSingleton()
			}
			else {
				return !BeanFactoryUtils.isFactoryDereference(name)
			}
		}
		else {
			return false
		}
  }

  isTypeMatch(name: string, typeToMatch: Class<Object> | Interface): boolean {
    return this.$isTypeMatch(name, typeToMatch, true)
  }

  protected $isTypeMatch(name: string, typeToMatch: Class<Object> | Interface, allowFactoryBeanInit: boolean) {

		const beanName = this.transformedBeanName(name)
		const isFactoryDereference = BeanFactoryUtils.isFactoryDereference(name)

		// Check manually registered singletons.
		const beanInstance = this.$getSingleton(beanName, false)
		if (beanInstance != undefined && beanInstance.constructor != NullBean) {
			if (isImplements<FactoryBean<any>>(beanInstance, FactoryBean)) {
				if (!isFactoryDereference) {
					const type = this.getTypeForFactoryBean(beanInstance)
					return (type != undefined) && (typeToMatch == type)
				}
				else {
          return Class.isClass(typeToMatch)
            ? beanInstance instanceof typeToMatch
            : isImplements(beanInstance, typeToMatch)
				}
			}
			else if (!isFactoryDereference) {
				if (Class.isClass(typeToMatch)
          ? beanInstance instanceof typeToMatch
          : isImplements(beanInstance, typeToMatch)) {
					// Direct match for exposed instance?
					return true
				}
				// else if (typeToMatch.hasGenerics() && containsBeanDefinition(beanName)) {
				// 	// Generics potentially only match on the target class, not on the proxy...
				// 	RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName)
				// 	Class<?> targetType = mbd.getTargetType()
				// 	if (targetType != undefined && targetType != ClassUtils.getUserClass(beanInstance)) {
				// 		// Check raw class match as well, making sure it's exposed on the proxy.
				// 		Class<?> classToMatch = typeToMatch.resolve()
				// 		if (classToMatch != undefined && !classToMatch.isInstance(beanInstance)) {
				// 			return false
				// 		}
				// 		if (typeToMatch.isAssignableFrom(targetType)) {
				// 			return true
				// 		}
				// 	}
				// 	ResolvableType resolvableType = mbd.targetType
				// 	if (resolvableType == undefined) {
				// 		resolvableType = mbd.factoryMethodReturnType
				// 	}
				// 	return (resolvableType != undefined && typeToMatch.isAssignableFrom(resolvableType))
				// }
			}
			return false
		}
		else if (this.containsSingleton(beanName) && !this.containsBeanDefinition(beanName)) {
			// undefined instance registered
			return false
		}

		// No singleton instance found -> check bean definition.
		const parentBeanFactory = this.getParentBeanFactory()
		if (parentBeanFactory != undefined && !this.containsBeanDefinition(beanName)) {
			// No bean definition found in this factory -> delegate to parent.
			return parentBeanFactory.isTypeMatch(this.originalBeanName(name), typeToMatch)
    }

    const mbd = this.getMergedLocalBeanDefinition(beanName)

    // TODO:

    const typesToMatch = [typeToMatch]

    let predictedType: Class<Object> | undefined

    if (predictedType == undefined) {
			predictedType = this.predictBeanType(beanName, mbd, ...typesToMatch)
			if (predictedType == undefined) {
				return false
			}
		}

    let beanType: Class<Object> | undefined

    if (Class.isAssignableFrom(FactoryBean, predictedType)) {
			// if (beanInstance == undefined && !isFactoryDereference) {
			// 	beanType = this.getTypeForFactoryBean(beanName, mbd, allowFactoryBeanInit)
			// 	predictedType = beanType
			// 	if (predictedType == undefined) {
			// 		return false
			// 	}
      // }
      return false
		}
		else if (isFactoryDereference) {
			// Special case: A SmartInstantiationAwareBeanPostProcessor returned a non-FactoryBean
			// type but we nevertheless are being asked to dereference a FactoryBean...
			// Let's check the original bean class and proceed with it if it is a FactoryBean.
			predictedType = this.predictBeanType(beanName, mbd, FactoryBean)
			if (predictedType == undefined || !Class.isAssignableFrom(FactoryBean, predictedType)) {
				return false
			}
		}

    if (beanType == undefined) {
			let definedType = mbd.targetType
			if (definedType == undefined) {
				definedType = mbd.factoryMethodReturnType
			}
			if (definedType != undefined && definedType == predictedType) {
				beanType = definedType
			}
    }

    if (beanType != undefined) {
			return Class.isAssignableFrom(typeToMatch, beanType)
    }

		return Class.isAssignableFrom(typeToMatch, predictedType)
  }

  // protected predictBeanType(beanName: string, mbd: RootBeanDefinition, ... typesToMatch: any[]): Class<Object> | undefined {
	// 	const targetType = mbd.getTargetType()
	// 	if (targetType != undefined) {
	// 		return targetType
	// 	}
	// 	if (mbd.getFactoryMethodName() != undefined) {
	// 		return undefined
	// 	}
	// 	return this.resolveBeanClass(mbd, beanName, typesToMatch)
	// }

  getType(name: string, allowFactoryBeanInit = true): Class<Object> | undefined {
		const beanName = this.transformedBeanName(name)

		// Check manually registered singletons.
		const beanInstance = this.$getSingleton(beanName, false)
		if (beanInstance != undefined && beanInstance.constructor != NullBean) {
			if (isImplements<FactoryBean<any>>(beanInstance, FactoryBean) && !BeanFactoryUtils.isFactoryDereference(name)) {
				return this.getTypeForFactoryBean(beanInstance) as Class<Object>
			}
			else {
				return beanInstance.constructor as Class<Object>
			}
		}

		// No singleton instance found -> check bean definition.
		const parentBeanFactory = this.getParentBeanFactory()
		if (parentBeanFactory != undefined && !this.containsBeanDefinition(beanName)) {
			// No bean definition found in this factory -> delegate to parent.
			return parentBeanFactory.getType(this.originalBeanName(name))
		}

		const mbd = this.getMergedLocalBeanDefinition(beanName)

		// Check decorated bean definition, if any: We assume it'll be easier
		// to determine the decorated bean's type than the proxy's type.
		// const dbd = mbd.getDecoratedDefinition()
		// if (dbd != undefined && !BeanFactoryUtils.isFactoryDereference(name)) {
		// 	RootBeanDefinition tbd = getMergedBeanDefinition(dbd.getBeanName(), dbd.getBeanDefinition(), mbd)
		// 	Class<?> targetClass = predictBeanType(dbd.getBeanName(), tbd)
		// 	if (targetClass != undefined && !FactoryBean.class.isAssignableFrom(targetClass)) {
		// 		return targetClass
		// 	}
		// }

		const beanClass = this.predictBeanType(beanName, mbd)

		// // Check bean class whether we're dealing with a FactoryBean.
		// if (beanClass != undefined && FactoryBean.class.isAssignableFrom(beanClass)) {
		// 	if (!BeanFactoryUtils.isFactoryDereference(name)) {
		// 		// If it's a FactoryBean, we want to look at what it creates, not at the factory class.
		// 		return this.getTypeForFactoryBean(beanName, mbd, allowFactoryBeanInit).resolve()
		// 	}
		// 	else {
		// 		return beanClass
		// 	}
		// }
		// else {
		return (!BeanFactoryUtils.isFactoryDereference(name) ? beanClass : undefined)
		// }
  }

  protected predictBeanType(beanName: string, mbd: RootBeanDefinition, ...typesToMatch: (Class<Object>|Interface)[]) {
		const targetType = mbd.getTargetType()
		if (targetType != undefined) {
			return targetType
		}
		if (mbd.getFactoryMethodName() != undefined) {
			return undefined
		}
		return this.resolveBeanClass(mbd, beanName, ...typesToMatch)
	}

  containsBean(name: string) {
		const beanName = this.transformedBeanName(name)
		if (this.containsSingleton(beanName) || this.containsBeanDefinition(beanName)) {
			return (!BeanFactoryUtils.isFactoryDereference(name) || this.isFactoryBean(name))
		}
		// Not found -> check parent.
		const parentBeanFactory = this.getParentBeanFactory()
		return (parentBeanFactory != undefined && parentBeanFactory.containsBean(this.originalBeanName(name)))
  }

  isBeanEligibleForMetadataCaching(beanName: string) {
		return this.alreadyCreated.has(beanName)
  }

  clearMetadataCache() {
		this.mergedBeanDefinitions.forEach((bd, beanName) => {
			if (!this.isBeanEligibleForMetadataCaching(beanName)) {
				bd.stale = true
			}
		})
	}
}
