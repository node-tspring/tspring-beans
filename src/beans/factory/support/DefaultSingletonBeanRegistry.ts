import { SingletonBeanRegistry } from '../config/SingletonBeanRegistry'
import { SimpleAliasRegistry, IllegalStateException, Implements } from '@tspring/core'
import { ObjectFactory } from '../ObjectFactory'
import { DisposableBean } from '../DisposableBean'
import { BeanCurrentlyInCreationException } from '../BeanCurrentlyInCreationException'
import { BeanCreationNotAllowedException } from '../BeanCreationNotAllowedException'

@Implements(SingletonBeanRegistry)
export class DefaultSingletonBeanRegistry extends SimpleAliasRegistry implements SingletonBeanRegistry {
  private singletonObjects = new Map<string, object>()
  private earlySingletonObjects = new Map<string, object>()
  private singletonFactories = new Map<string, ObjectFactory<object>>()
  private registeredSingletons = new Set<string>()
  private singletonsCurrentlyInCreation = new Set<string>()
  private inCreationCheckExclusions = new Set<string>()
	private disposableBeans = new Map<string, Object>()
	private dependentBeanMap = new Map<string, Set<string>>()
	private containedBeanMap = new Map<string, Set<string>>()
	private dependenciesForBeanMap = new Map<string, Set<string>>()
	private singletonsCurrentlyInDestruction = false

  protected removeSingleton(beanName: string) {
    this.singletonObjects.delete(beanName)
    this.singletonFactories.delete(beanName)
    this.earlySingletonObjects.delete(beanName)
    this.registeredSingletons.delete(beanName)
  }

  protected addSingletonFactory(beanName: string, singletonFactory: ObjectFactory<object>) {
    if (!this.singletonObjects.has(beanName)) {
      this.singletonFactories.set(beanName, singletonFactory)
      this.earlySingletonObjects.delete(beanName)
      this.registeredSingletons.add(beanName)
    }
  }

  containsSingleton(beanName: string) {
		return this.singletonObjects.has(beanName)
  }

  getSingletonNames() {
    this.registeredSingletons
		return Array.from(this.registeredSingletons)
  }

  getSingletonCount() {
		return this.registeredSingletons.size
  }

  setCurrentlyInCreation(beanName: string, inCreation: boolean) {
		if (!inCreation) {
			this.inCreationCheckExclusions.add(beanName)
		} else {
			this.inCreationCheckExclusions.delete(beanName)
		}
  }

  isCurrentlyInCreation(beanName: string) {
		return (!this.inCreationCheckExclusions.has(beanName) && this.isActuallyInCreation(beanName))
	}

  protected isActuallyInCreation(beanName: string) {
		return this.isSingletonCurrentlyInCreation(beanName)
	}

  isSingletonCurrentlyInCreation(beanName: string) {
		return this.singletonsCurrentlyInCreation.has(beanName)
  }

  protected beforeSingletonCreation(beanName: string) {
		if (!this.inCreationCheckExclusions.has(beanName) && !this.singletonsCurrentlyInCreation.add(beanName)) {
			throw new BeanCurrentlyInCreationException(beanName)
		}
  }

  protected afterSingletonCreation(beanName: string) {
		if (!this.inCreationCheckExclusions.has(beanName) && !this.singletonsCurrentlyInCreation.delete(beanName)) {
			throw new IllegalStateException(`Singleton ${beanName} isn't currently in creation`)
		}
  }

  registerDisposableBean(beanName: string, bean: DisposableBean) {
		this.disposableBeans.set(beanName, bean)
  }

  protected clearSingletonCache() {
    this.singletonObjects.clear()
    this.singletonFactories.clear()
    this.earlySingletonObjects.clear()
    this.registeredSingletons.clear()
    this.singletonsCurrentlyInDestruction = false
	}

	getSingleton(beanName: string): object
	getSingleton(beanName: string, singletonFactory: ObjectFactory<object> ): object
  getSingleton(beanName: string, singletonFactory?: ObjectFactory<object> ) {
    if (singletonFactory) {
      let singletonObject = this.singletonObjects.get(beanName)
      if (!singletonObject) {
        if (this.singletonsCurrentlyInDestruction) {
          throw new BeanCreationNotAllowedException(beanName, 'Singleton bean creation not allowed while singletons of this factory are in destruction (Do not request a bean from a BeanFactory in a destroy method implementation!')
        }
        console.debug(`===> Creating shared instance of singleton bean '${beanName}'`)
        this.beforeSingletonCreation(beanName)
        let newSingleton = false
        try {
          singletonObject = singletonFactory.getObject()
          newSingleton = true
        } catch (ex) {
          // Has the singleton object implicitly appeared in the meantime ->
          // if yes, proceed with it since the exception indicates that state.
          singletonObject = this.singletonObjects.get(beanName)
          if (singletonObject == undefined) {
            throw ex
          }
        } finally {
          this.afterSingletonCreation(beanName)
        }
        if (newSingleton) {
          this.addSingleton(beanName, singletonObject)
        }
      }
      return singletonObject
    } else {
      return this.$getSingleton(beanName, true)
    }
  }

  protected addSingleton(beanName: string, singletonObject: object) {
    this.singletonObjects.set(beanName, singletonObject)
    this.singletonFactories.delete(beanName)
    this.earlySingletonObjects.delete(beanName)
    this.registeredSingletons.add(beanName)
  }

	destroySingleton(beanName: string) {
    this.removeSingleton(beanName)

		// Destroy the corresponding DisposableBean instance.
    const disposableBean = this.disposableBeans.get(beanName)
    if (disposableBean) {
      this.destroyBean(beanName, disposableBean as DisposableBean)
      this.disposableBeans.delete(beanName)
    }
  }

  protected destroyBean(beanName: string, bean: DisposableBean) {
    // Trigger destruction of dependent beans first...

		const dependencies = this.dependentBeanMap.get(beanName)
    if (dependencies) {
			console.debug(`Retrieved dependent beans for bean '${beanName}': ${dependencies}`)
			dependencies.forEach((dependentBeanName) => {
				this.destroySingleton(dependentBeanName)

      })
      this.dependentBeanMap.delete(beanName)
		}

		// Actually destroy the bean now...
		if (bean != undefined) {
			try {
				bean.destroy()
			} catch (ex) {
				console.warn(`Destruction of bean with name '${beanName}' threw an exception`, ex)
			}
		}

		// Trigger destruction of contained beans...
		const containedBeans = this.containedBeanMap.get(beanName)
		if (containedBeans) {
      containedBeans.forEach((containedBeanName) => {
				this.destroySingleton(containedBeanName)
      })
      this.containedBeanMap.delete(beanName)
		}

    // Remove destroyed bean from other beans' dependencies.
    this.dependentBeanMap.forEach((dependenciesToClean, key) => {
      dependenciesToClean.delete(beanName)
      if (dependenciesToClean.size == 0) {
        this.dependentBeanMap.delete(key)
      }
    })

		// Remove destroyed bean's prepared dependency information.
		this.dependenciesForBeanMap.delete(beanName)
  }

  protected hasDependentBean(beanName: string) {
		return this.dependentBeanMap.has(beanName)
  }

  getDependentBeans(beanName: string) {
		const dependentBeans = this.dependentBeanMap.get(beanName)
		if (dependentBeans == undefined) {
			return []
		}
		return Array.from(dependentBeans)
  }

  protected $getSingleton(beanName: string, allowEarlyReference: boolean) {
		let singletonObject = this.singletonObjects.get(beanName)
		if (singletonObject == undefined && this.isSingletonCurrentlyInCreation(beanName)) {
      singletonObject = this.earlySingletonObjects.get(beanName)
      if (singletonObject == undefined && allowEarlyReference) {
        const singletonFactory = this.singletonFactories.get(beanName)
        if (singletonFactory) {
          singletonObject = singletonFactory.getObject()
          this.earlySingletonObjects.set(beanName, singletonObject)
          this.singletonFactories.delete(beanName)
        }
      }
		}
		return singletonObject
  }

  registerSingleton(beanName: string, singletonObject: Object): void {
    const oldObject = this.singletonObjects.get(beanName)
    if (oldObject) {
      throw new IllegalStateException(`Could not register object [${singletonObject}] under bean name '${beanName}': there is already object [${oldObject}] bound`)
    }
    this.addSingleton(beanName, singletonObject)
  }

  registerDependentBean(beanName: string, dependentBeanName: string): void {
    const canonicalName = this.canonicalName(beanName)

    let dependentBeans = this.dependentBeanMap.get(canonicalName)
    if (dependentBeans == undefined) {
      dependentBeans = new Set<string>()
      this.dependentBeanMap.set(canonicalName, dependentBeans)
    }

    if (dependentBeans.has(dependentBeanName)) {
      return
    }

    dependentBeans.add(dependentBeanName)

    let dependenciesForBean =	this.dependenciesForBeanMap.get(dependentBeanName)
    if (dependenciesForBean == undefined) {
      dependenciesForBean = new Set<string>()
      this.dependentBeanMap.set(canonicalName, dependenciesForBean)
    }
		dependenciesForBean.add(canonicalName)
  }

  getDependenciesForBean(beanName: string): string[] {
    const dependenciesForBean = this.dependenciesForBeanMap.get(beanName)
		if (dependenciesForBean == undefined) {
			return []
		}
		return Array.from(dependenciesForBean)
  }

}
