import { SimpleAutowireCandidateResolver } from './SimpleAutowireCandidateResolver'
import { BeanFactoryAware } from '../BeanFactoryAware'
import { Implements } from '@tspring/core'
import { BeanFactory } from '../BeanFactory'
import { BeanDefinitionHolder } from '../config/BeanDefinitionHolder'
import { DependencyDescriptor } from '../config/DependencyDescriptor'

@Implements(BeanFactoryAware)
export class GenericTypeAwareAutowireCandidateResolver extends SimpleAutowireCandidateResolver implements BeanFactoryAware {
  private beanFactory?: BeanFactory

  setBeanFactory(beanFactory: BeanFactory): void {
    this.beanFactory = beanFactory
  }

  protected getBeanFactory() {
		return this.beanFactory
  }

  isAutowireCandidate(bdHolder: BeanDefinitionHolder, descriptor: DependencyDescriptor ) {
		if (!super.isAutowireCandidate(bdHolder, descriptor)) {
			return false
		}
		return false // checkGenericTypeMatch(bdHolder, descriptor)
	}
}
