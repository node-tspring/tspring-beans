import { BeanDefinition } from '../config/BeanDefinition'
import { AnnotationMetadata, Method, Interface } from '@tspring/core'

export interface AnnotatedBeanDefinition extends BeanDefinition {

	getMetadata(): AnnotationMetadata

	getFactoryMethod(): Method | undefined

}

export const AnnotatedBeanDefinition = new Interface('AnnotatedBeanDefinition', [BeanDefinition])
