import {
  Class,
  AttributeAccessor,
  Interface
} from '@tspring/core'
import { BeanMetadataElement } from '../../BeanMetadataElement'
import { ConfigurableBeanFactory } from './ConfigurableBeanFactory'
import { MutablePropertyValues } from '../../MutablePropertyValues'

export interface BeanDefinition extends AttributeAccessor, BeanMetadataElement {

  setParentName(parentName: string | undefined): void
  getParentName(): string

  setBeanClass(beanClass: Class<Object>): void
  getBeanClass(): Class<Object>

  setBeanClassName(beanClassName: string | undefined): void
  getBeanClassName(): string | undefined

  setScope(scope: string | undefined): void
  getScope(): string

  setLazyInit(lazyInit: boolean): void
  isLazyInit(): boolean

  // setDependsOn(...dependsOn: string[]): void
  // getDependsOn(): string[]

  setAutowireCandidate(autowireCandidate: boolean): void
  isAutowireCandidate(): boolean

  setPrimary(primary: boolean): void
  isPrimary(): boolean

  setFactoryBeanName(factoryBeanName: string | undefined): void
  getFactoryBeanName(): string | undefined

  setFactoryMethodName(factoryMethodName: string | symbol | undefined): void
  getFactoryMethodName(): string | symbol | undefined

  // getConstructorArgumentValues(): ConstructorArgumentValues
  hasConstructorArgumentValues(): boolean

  getPropertyValues(): MutablePropertyValues
  hasPropertyValues(): boolean

  setInitMethodName(initMethodName: string): void
  getInitMethodName(): string | undefined

  setDestroyMethodName(destroyMethodName: string): void
  getDestroyMethodName(): string | undefined

  // setRole(role: number): void
  // getRole(): number

  setDescription(description: string | undefined): void
  getDescription(): string | undefined

  isSingleton(): boolean

  isPrototype(): boolean

  isAbstract(): boolean

  getResourceDescription(): string | undefined

  getOriginatingBeanDefinition(): BeanDefinition | undefined

  getResolvableType(): Class<Object> | undefined
}

export const BeanDefinition = new (class extends Interface {
  readonly EXTENDS = [AttributeAccessor, BeanMetadataElement]

  /**
	 * Scope identifier for the standard singleton scope: "singleton".
	 * <p>Note that extended bean factories might support further scopes.
	 * @see #setScope
	 */
  readonly SCOPE_SINGLETON = ConfigurableBeanFactory.SCOPE_SINGLETON

	/**
	 * Scope identifier for the standard prototype scope: "prototype".
	 * <p>Note that extended bean factories might support further scopes.
	 * @see #setScope
	 */
  readonly SCOPE_PROTOTYPE = ConfigurableBeanFactory.SCOPE_PROTOTYPE


	/**
	 * Role hint indicating that a {@code BeanDefinition} is a major part
	 * of the application. Typically corresponds to a user-defined bean.
	 */
  readonly ROLE_APPLICATION = 0

	/**
	 * Role hint indicating that a {@code BeanDefinition} is a supporting
	 * part of some larger configuration, typically an outer
	 * {@link org.springframework.beans.factory.parsing.ComponentDefinition}.
	 * {@code SUPPORT} beans are considered important enough to be aware
	 * of when looking more closely at a particular
	 * {@link org.springframework.beans.factory.parsing.ComponentDefinition},
	 * but not when looking at the overall configuration of an application.
	 */
  readonly ROLE_SUPPORT = 1

	/**
	 * Role hint indicating that a {@code BeanDefinition} is providing an
	 * entirely background role and has no relevance to the end-user. This hint is
	 * used when registering beans that are completely part of the internal workings
	 * of a {@link org.springframework.beans.factory.parsing.ComponentDefinition}.
	 */
  readonly ROLE_INFRASTRUCTURE = 2

})('BeanDefinition', [AttributeAccessor, BeanMetadataElement])
