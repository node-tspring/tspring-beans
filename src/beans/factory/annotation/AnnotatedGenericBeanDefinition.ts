import { GenericBeanDefinition } from '../support/GenericBeanDefinition'
import { AnnotatedBeanDefinition } from './AnnotatedBeanDefinition'
import { Implements, AnnotationMetadata, Class, StandardAnnotationMetadata, Method } from '@tspring/core'

@Implements(AnnotatedBeanDefinition)
export class AnnotatedGenericBeanDefinition extends GenericBeanDefinition implements AnnotatedBeanDefinition {
  private metadata: AnnotationMetadata
  private factoryMethodMetadata: Method | undefined

	constructor(beanClass: Class<Object>)
  constructor(metadata: AnnotationMetadata )
  constructor(metadata: AnnotationMetadata, factoryMethodMetadata: Method)

  constructor(arg1: Class<Object> | AnnotationMetadata, factoryMethodMetadata?: Method ) {
    super()
    if (Class.isClass(arg1)) {
      this.setBeanClass(arg1)
		  this.metadata = AnnotationMetadata.introspect(arg1)
    } else {
      if (arg1 instanceof StandardAnnotationMetadata) {
        this.setBeanClass(arg1.getClass())
      }
      else {
        this.setBeanClassName(arg1.getClassName())
      }
      this.metadata = arg1
    }
  }

  getMetadata(): AnnotationMetadata {
    return this.metadata
  }

  getFactoryMethod(): Method | undefined {
		return this.factoryMethodMetadata
  }
}
