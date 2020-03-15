import { BeanFactoryAware } from '../BeanFactoryAware'
import { MergedBeanDefinitionPostProcessor } from '../support/MergedBeanDefinitionPostProcessor'
import { PriorityOrdered, Ordered, IllegalArgumentException, Class, isImplements, Implements, Annotation, Field, CollectionUtils, Method } from '@tspring/core'
import { InstantiationAwareBeanPostProcessorAdapter } from '../config/InstantiationAwareBeanPostProcessorAdapter'
import { ConfigurableListableBeanFactory } from '../config/ConfigurableListableBeanFactory'
import { BeanFactory } from '../BeanFactory'
import { RootBeanDefinition } from '../support/RootBeanDefinition'
import { PropertyValues } from '../../PropertyValues'
import { Autowired } from './Autowired'
import { InjectionMetadata } from './InjectionMetadata'
import { DependencyDescriptor } from '../config/DependencyDescriptor'
import { Value } from './Value'
import { UnsatisfiedDependencyException } from '../UnsatisfiedDependencyException'
import { InjectionPoint } from '../InjectionPoint'
import { BeanCreationException } from '../BeanCreationException'

@Implements(MergedBeanDefinitionPostProcessor, PriorityOrdered, BeanFactoryAware)
export class AutowiredAnnotationBeanPostProcessor extends InstantiationAwareBeanPostProcessorAdapter implements MergedBeanDefinitionPostProcessor, PriorityOrdered, BeanFactoryAware {

  private order = Ordered.LOWEST_PRECEDENCE - 2
	private beanFactory?: ConfigurableListableBeanFactory
	private injectionMetadataCache = new Map<string, InjectionMetadata>()
	private autowiredAnnotationTypes = new Set<Annotation>()

	constructor () {
		super()
		this.autowiredAnnotationTypes.add(Autowired)
		this.autowiredAnnotationTypes.add(Value)
	}

	setAutowiredAnnotationType(autowiredAnnotationType: Annotation) {
		this.autowiredAnnotationTypes.clear()
		this.autowiredAnnotationTypes.add(autowiredAnnotationType)
	}

	setAutowiredAnnotationTypes(autowiredAnnotationTypes: Set<Annotation> ) {
		this.autowiredAnnotationTypes.clear()
		CollectionUtils.addAll(this.autowiredAnnotationTypes, autowiredAnnotationTypes)
	}

  setBeanFactory(beanFactory: BeanFactory): void {
    if (!isImplements<ConfigurableListableBeanFactory>(beanFactory, ConfigurableListableBeanFactory)) {
			throw new IllegalArgumentException(`AutowiredAnnotationBeanPostProcessor requires a ConfigurableListableBeanFactory: ${beanFactory}`)
		}
		this.beanFactory = beanFactory
  }

  setOrder(order: number) {
		this.order = order
  }

  getOrder(): number {
    return this.order
  }

  postProcessMergedBeanDefinition(beanDefinition: RootBeanDefinition, beanType: Class<Object>, beanName: string): void {
    const metadata = this.findAutowiringMetadata(beanName, beanType)
		metadata.checkConfigMembers(beanDefinition)
  }

  resetBeanDefinition(beanName: string): void {
    console.log('### resetBeanDefinition++++ ', beanName)
  }

  postProcessProperties(pvs: PropertyValues, bean: Object, beanName: string): PropertyValues | undefined {
    const metadata = this.findAutowiringMetadata(beanName, bean.constructor as Class<Object>, pvs)
		try {
			metadata.inject(bean, beanName, pvs)
		} catch (ex) {
			throw new BeanCreationException(undefined, beanName, 'Injection of autowired dependencies failed', ex)
		}
		return pvs
  }

  private findAutowiringMetadata(beanName: string, clazz: Class<Object>, pvs?: PropertyValues): InjectionMetadata {
		// Fall back to class name as cache key, for backwards compatibility with custom callers.
		const cacheKey = beanName == undefined ? clazz.name : beanName
		// Quick check on the concurrent map first, with minimal locking.
		let metadata = this.injectionMetadataCache.get(cacheKey)
    if (InjectionMetadata.needsRefresh(metadata, clazz)) {
      if (metadata != undefined) {
        metadata.clear(pvs!)
      }
      metadata = this.buildAutowiringMetadata(clazz)
      this.injectionMetadataCache.set(cacheKey, metadata)
    }
		return metadata!
  }

	private buildAutowiringMetadata(clazz: Class<Object>): InjectionMetadata {
    // if (!AnnotationUtils.isCandidateClass(clazz, this.autowiredAnnotationTypes)) {
		// 	return InjectionMetadata.EMPTY
		// }

		const elements: InjectionMetadata.InjectedElement[] = []
		let targetClass = clazz

		// do {
			const currElements: InjectionMetadata.InjectedElement[] = []

      const annotationedMembers = Annotation.getAnnotationedMembers(targetClass)
      const prototype = targetClass.prototype
      for (const member of annotationedMembers) {
				let autowiredParams: any | undefined

				for (const type of this.autowiredAnnotationTypes) {
					autowiredParams = member.getAnnotationParams(type)
					if (autowiredParams != undefined) break
				}

				if (autowiredParams) {
					console.log('++++>>>>>>>', autowiredParams)
					if (member instanceof Field) {
						const required = autowiredParams.required || false
						currElements.push(new this.AutowiredFieldElement(member, required))
					}

					else if (member instanceof Method) {

					}
				}
      }

		// 	ReflectionUtils.doWithLocalFields(targetClass, field => {
		// 		const ann = this.findAutowiredAnnotation(field)
		// 		if (ann != undefined) {
		// 			const required = this.determineRequiredStatus(ann)
		// 			currElements.push(new AutowiredFieldElement(field, required))
		// 		}
		// 	})

		// 	ReflectionUtils.doWithLocalMethods(targetClass, method => {
		// 		const bridgedMethod = BridgeMethodResolver.findBridgedMethod(method)
		// 		if (!BridgeMethodResolver.isVisibilityBridgeMethodPair(method, bridgedMethod)) {
		// 			return
		// 		}
		// 		const ann = this.findAutowiredAnnotation(bridgedMethod)
		// 		if (ann != undefined && method.equals(ClassUtils.getMostSpecificMethod(method, clazz))) {
		// 			if (method.getParameterCount() == 0) {
		// 				console.debug("Autowired annotation should only be used on methods with parameters: " +	method)
		// 			}
		// 			const required = this.determineRequiredStatus(ann)
		// 			const pd = BeanUtils.findPropertyForMethod(bridgedMethod, clazz)
		// 			currElements.push(new AutowiredMethodElement(method, required, pd))
		// 		}
		// 	})

			elements.push(...currElements)
		// 	targetClass = targetClass.getSuperclass()
		// }
		// while (targetClass != undefined && targetClass != Object)

		return InjectionMetadata.forElements(elements, clazz)
	}

	private resolvedCachedArgument(beanName: string | undefined, cachedArgument: any | undefined ) {
		if (cachedArgument instanceof DependencyDescriptor) {
			const descriptor = cachedArgument
			return this.beanFactory!.resolveDependency(descriptor, beanName)
		}
		else {
			return cachedArgument
		}
	}

	private registerDependentBeans(beanName: string | undefined, autowiredBeanNames: Set<string>) {
		if (beanName != undefined) {
			for (const autowiredBeanName of autowiredBeanNames) {
				if (this.beanFactory != undefined && this.beanFactory.containsBean(autowiredBeanName)) {
					this.beanFactory.registerDependentBean(autowiredBeanName, beanName)
				}
				console.debug(`Autowiring by type from bean name '${beanName}' to bean named '${autowiredBeanName}'`)
			}
		}
	}

	private static ShortcutDependencyDescriptor = class ShortcutDependencyDescriptor extends DependencyDescriptor {

		private shortcut: string

		private requiredType: Class<Object>

		constructor(original: DependencyDescriptor, shortcut: string, requiredType: Class<Object>) {
			super(original)
			this.shortcut = shortcut
			this.requiredType = requiredType
		}

		resolveShortcut(beanFactory: BeanFactory) {
			return beanFactory.getBean(this.shortcut, this.requiredType)
		}
	}

	private AutowiredFieldElement = ((outerThis) => class AutowiredFieldElement extends InjectionMetadata.InjectedElement {

		private cached = false

		private cachedFieldValue: any

		constructor(field: Field, private required: boolean) {
			super(field, undefined)
			this.required = required
		}

		inject(bean: Object, beanName: string, pvs: PropertyValues) {
			const field = this.member as Field
			let value
			if (this.cached) {
				value = outerThis.resolvedCachedArgument(beanName, this.cachedFieldValue)
			}
			else {
				const desc = new DependencyDescriptor(field, this.required)
				desc.setContainingClass(bean.constructor as Class<Object>)
				const autowiredBeanNames = new Set<string>()
				const typeConverter = outerThis.beanFactory!.getTypeConverter()
				try {
					value = outerThis.beanFactory!.resolveDependency(desc, beanName, autowiredBeanNames, typeConverter)
				} catch (ex) {
					throw new UnsatisfiedDependencyException(undefined, beanName, new InjectionPoint(field), ex)
				}
				if (!this.cached) {
					if (value != undefined || this.required) {
						this.cachedFieldValue = desc
						outerThis.registerDependentBeans(beanName, autowiredBeanNames)
						if (autowiredBeanNames.size == 1) {
							const autowiredBeanName = autowiredBeanNames.keys().next().value
							if (outerThis.beanFactory!.containsBean(autowiredBeanName) &&
									outerThis.beanFactory!.isTypeMatch(autowiredBeanName, field.getType())) {
								this.cachedFieldValue = new AutowiredAnnotationBeanPostProcessor.ShortcutDependencyDescriptor(desc, autowiredBeanName, field.getType())
							}
						}
					}
					else {
						this.cachedFieldValue = undefined
					}
					this.cached = true
				}
			}
			if (value != undefined) {
				field.set(bean, value)
			}
		}
	})(this)
}
