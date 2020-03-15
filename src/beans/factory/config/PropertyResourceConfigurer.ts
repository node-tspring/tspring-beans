import { BeanFactoryPostProcessor } from './BeanFactoryPostProcessor'
import { PriorityOrdered, Implements, PropertiesLoaderSupport, Ordered, Properties } from '@tspring/core'
import { ConfigurableListableBeanFactory } from './ConfigurableListableBeanFactory'
import { BeanInitializationException } from '../BeanInitializationException'

@Implements(BeanFactoryPostProcessor, PriorityOrdered)
export abstract class PropertyResourceConfigurer extends PropertiesLoaderSupport implements BeanFactoryPostProcessor, PriorityOrdered {
	private order = Ordered.LOWEST_PRECEDENCE

  setOrder(order: number) {
		this.order = order
  }

  getOrder(): number {
    return this.order
  }

  postProcessBeanFactory(beanFactory: ConfigurableListableBeanFactory): void {
    try {
			const mergedProps = this.mergeProperties()

			// Convert the merged properties, if necessary.
			this.convertProperties(mergedProps)

			// Let the subclass process the properties.
			this.processProperties(beanFactory, mergedProps)
		}
		catch (ex) {
			throw new BeanInitializationException('Could not load properties', ex)
		}
  }

  processProperties(beanFactory: ConfigurableListableBeanFactory, mergedProps: Properties) {

  }

  convertProperties(mergedProps: Properties) {

  }
}
