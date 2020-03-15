import { Implements } from '@tspring/core'
import { AutowireCandidateResolver } from './AutowireCandidateResolver'
import { DependencyDescriptor } from '../config/DependencyDescriptor'
import { BeanDefinitionHolder } from '../config/BeanDefinitionHolder'

@Implements(AutowireCandidateResolver)
export class SimpleAutowireCandidateResolver implements AutowireCandidateResolver {
  isAutowireCandidate(bdHolder: BeanDefinitionHolder, descriptor: DependencyDescriptor): boolean {
    return bdHolder.getBeanDefinition().isAutowireCandidate()
  }

  isRequired(descriptor: DependencyDescriptor): boolean {
    return descriptor.isRequired()
  }

  hasQualifier(descriptor: DependencyDescriptor): boolean {
    return false
  }

  getSuggestedValue(descriptor: DependencyDescriptor): Object | undefined {
    return undefined
  }

  getLazyResolutionProxyIfNecessary(descriptor: DependencyDescriptor, beanName: string | undefined): Object | undefined {
    return undefined
  }
}
