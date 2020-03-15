import { DefaultSingletonBeanRegistry } from './DefaultSingletonBeanRegistry'
import { FactoryBean } from '../FactoryBean'
import { NullBean } from './NullBean'
import { BeanCreationException } from '../BeanCreationException'
import { BeanCurrentlyInCreationException } from '../BeanCurrentlyInCreationException'

export abstract class FactoryBeanRegistrySupport extends DefaultSingletonBeanRegistry {
	private factoryBeanObjectCache = new Map<string, Object>()

	protected getCachedObjectForFactoryBean(beanName: string) {
		return this.factoryBeanObjectCache.get(beanName)
  }

  protected postProcessObjectFromFactoryBean(object: object, beanName: string) {
		return object
	}

  protected getObjectFromFactoryBean(factory: FactoryBean<any>, beanName: string, shouldPostProcess: boolean) {
		if (factory.isSingleton() && this.containsSingleton(beanName)) {
      let object = this.factoryBeanObjectCache.get(beanName)
      if (object == undefined) {
        object = this.doGetObjectFromFactoryBean(factory, beanName)
        // Only post-process and store if not put there already during getObject() call above
        // (e.g. because of circular reference processing triggered by custom getBean calls)
        const alreadyThere = this.factoryBeanObjectCache.get(beanName)
        if (alreadyThere != undefined) {
          object = alreadyThere
        }
        else {
          if (shouldPostProcess) {
            if (this.isSingletonCurrentlyInCreation(beanName)) {
              // Temporarily return non-post-processed object, not storing it yet..
              return object
            }
            this.beforeSingletonCreation(beanName)
            try {
              object = this.postProcessObjectFromFactoryBean(object, beanName)
            } catch (ex) {
              throw new BeanCreationException(beanName, `Post-processing of FactoryBean's singleton object failed`, ex)
            } finally {
              this.afterSingletonCreation(beanName)
            }
          }
          if (this.containsSingleton(beanName)) {
            this.factoryBeanObjectCache.set(beanName, object)
          }
        }
      }
      return object
		}
		else {
			let object = this.doGetObjectFromFactoryBean(factory, beanName)
			if (shouldPostProcess) {
				try {
					object = this.postProcessObjectFromFactoryBean(object, beanName)
				}
				catch (ex) {
					throw new BeanCreationException(beanName, "Post-processing of FactoryBean's object failed", ex)
				}
			}
			return object
		}
  }

  private doGetObjectFromFactoryBean(factory: FactoryBean<object> , beanName: string) {
		let object
		try {
			object = factory.getObject()
		} catch (ex) {
			throw new BeanCreationException(beanName, ex)
		}

		// Do not accept a undefined value for a FactoryBean that's not fully
		// initialized yet: Many FactoryBeans just return undefined then.
		if (object == undefined) {
			if (this.isSingletonCurrentlyInCreation(beanName)) {
				throw new BeanCurrentlyInCreationException(beanName, 'FactoryBean which is currently in creation returned undefined from getObject')
			}
			object = new NullBean()
		}
		return object
	}

	protected getTypeForFactoryBean<T>(factoryBean: FactoryBean<T>) {
		try {
			return factoryBean.getObjectType()
		} catch (ex) {
			// Thrown from the FactoryBean's getObjectType implementation.
			console.debug('FactoryBean threw exception from getObjectType, despite the contract saying that it should return undefined if the type of its object cannot be determined yet', ex)
		}
	}
}
