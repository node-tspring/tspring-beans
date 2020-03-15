import { BeanFactory } from '../BeanFactory'
import { Class, Interface } from '@tspring/core'
import { NamedBeanHolder } from './NamedBeanHolder'
import { TypeConverter } from '../../TypeConverter'
import { DependencyDescriptor } from './DependencyDescriptor'

export interface AutowireCapableBeanFactory extends BeanFactory {
	createBean<T>(beanClass: Class<T>): T
	createBean(beanClass: Class<Object>, autowireMode: number, dependencyCheck: boolean ): Object

	applyBeanPostProcessorsBeforeInitialization(existingBean: Object, beanName: string): Object
	applyBeanPostProcessorsAfterInitialization(existingBean: Object, beanName: string): Object

	resolveNamedBean<T>(requiredType: Class<T> ): NamedBeanHolder<T>

	resolveDependency(descriptor: DependencyDescriptor, requestingBeanName: string | undefined,	autowiredBeanNames?: Set<string>, typeConverter?: TypeConverter): any
}

export const AutowireCapableBeanFactory = new (class extends Interface{
	/**
	 * Constant that indicates no externally defined autowiring. Note that
	 * BeanFactoryAware etc and annotation-driven injection will still be applied.
	 * @see #createBean
	 * @see #autowire
	 * @see #autowireBeanProperties
	 */
  readonly AUTOWIRE_NO = 0

	/**
	 * Constant that indicates autowiring bean properties by name
	 * (applying to all bean property setters).
	 * @see #createBean
	 * @see #autowire
	 * @see #autowireBeanProperties
	 */
  readonly AUTOWIRE_BY_NAME = 1

	/**
	 * Constant that indicates autowiring bean properties by type
	 * (applying to all bean property setters).
	 * @see #createBean
	 * @see #autowire
	 * @see #autowireBeanProperties
	 */
  readonly AUTOWIRE_BY_TYPE = 2

	/**
	 * Constant that indicates autowiring the greediest constructor that
	 * can be satisfied (involves resolving the appropriate constructor).
	 * @see #createBean
	 * @see #autowire
	 */
  readonly AUTOWIRE_CONSTRUCTOR = 3

	/**
	 * Constant that indicates determining an appropriate autowire strategy
	 * through introspection of the bean class.
	 * @see #createBean
	 * @see #autowire
	 * @deprecated as of Spring 3.0: If you are using mixed autowiring strategies,
	 * prefer annotation-based autowiring for clearer demarcation of autowiring needs.
	 */
  // @Deprecated
  readonly AUTOWIRE_AUTODETECT = 4

	/**
	 * Suffix for the "original instance" convention when initializing an existing
	 * bean instance: to be appended to the fully-qualified bean class name,
	 * e.g. "com.mypackage.MyClass.ORIGINAL", in order to enforce the given instance
	 * to be returned, i.e. no proxies etc.
	 * @since 5.1
	 * @see #initializeBean(Object, string)
	 * @see #applyBeanPostProcessorsBeforeInitialization(Object, string)
	 * @see #applyBeanPostProcessorsAfterInitialization(Object, string)
	 */
  readonly ORIGINAL_INSTANCE_SUFFIX = '.ORIGINAL'
})('AutowireCapableBeanFactory', [BeanFactory])
