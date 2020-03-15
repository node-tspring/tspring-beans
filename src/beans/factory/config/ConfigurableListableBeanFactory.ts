import { ListableBeanFactory } from '../ListableBeanFactory'
import { ConfigurableBeanFactory } from './ConfigurableBeanFactory'
import { AutowireCapableBeanFactory } from './AutowireCapableBeanFactory'
import { BeanDefinition } from './BeanDefinition'
import { Interface } from '@tspring/core'

export interface ConfigurableListableBeanFactory extends ListableBeanFactory, AutowireCapableBeanFactory, ConfigurableBeanFactory {
  preInstantiateSingletons(): void
	isConfigurationFrozen(): boolean
	freezeConfiguration(): void
	clearMetadataCache(): void
	getBeanDefinition(beanName: string): BeanDefinition
}

export const ConfigurableListableBeanFactory = new Interface(
	'ConfigurableListableBeanFactory',
	[ListableBeanFactory, AutowireCapableBeanFactory, ConfigurableBeanFactory]
)
