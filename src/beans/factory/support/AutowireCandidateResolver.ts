import { BeanDefinitionHolder } from '../config/BeanDefinitionHolder'
import { DependencyDescriptor } from '../config/DependencyDescriptor'
import { Interface } from '@tspring/core'

export interface AutowireCandidateResolver {
  isAutowireCandidate(bdHolder: BeanDefinitionHolder, descriptor: DependencyDescriptor): boolean

  isRequired(descriptor: DependencyDescriptor): boolean

  hasQualifier(descriptor: DependencyDescriptor): boolean

  getSuggestedValue(descriptor: DependencyDescriptor): Object | undefined

  getLazyResolutionProxyIfNecessary(descriptor: DependencyDescriptor, beanName: string | undefined): Object | undefined
}

export const AutowireCandidateResolver = new Interface('AutowireCandidateResolver')
