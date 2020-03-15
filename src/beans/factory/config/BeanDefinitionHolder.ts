import { BeanMetadataElement } from '../../BeanMetadataElement'
import { BeanDefinition } from './BeanDefinition'
import { Implements } from '@tspring/core'

@Implements(BeanMetadataElement)
export class BeanDefinitionHolder implements BeanMetadataElement {
  private beanDefinition: BeanDefinition
  private beanName: string
  private aliases: string[]

  constructor (beanDefinition: BeanDefinition, beanName: string)
  constructor (beanDefinition: BeanDefinition, beanName: string, aliases: string[])
  constructor (beanDefinition: BeanDefinition, beanName: string, aliases?: string[]) {
    this.beanDefinition = beanDefinition
    this.beanName = beanName
    this.aliases = aliases || []
  }

  getBeanDefinition() {
		return this.beanDefinition
  }

  getBeanName() {
		return this.beanName
  }

  getAliases() {
		return this.aliases
  }

  matchesName(candidateName: string) {
		return (candidateName != undefined && candidateName == this.beanName) || this.aliases.indexOf(candidateName) != -1
	}

  getSource<T>(): T {
    throw new Error('getSource ++++ Method not implemented.')
  }
}
