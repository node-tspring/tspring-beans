import { Implements, StringValueResolver } from '@tspring/core'
import { BeanNameAware } from '../BeanNameAware'
import { BeanFactoryAware } from '../BeanFactoryAware'
import { PropertyResourceConfigurer } from './PropertyResourceConfigurer'
import { BeanFactory } from '../BeanFactory'
import { ConfigurableListableBeanFactory } from './ConfigurableListableBeanFactory'
import { BeanDefinitionVisitor } from './BeanDefinitionVisitor'
import { BeanDefinitionStoreException } from '../BeanDefinitionStoreException'

@Implements(BeanNameAware, BeanFactoryAware)
export abstract class PlaceholderConfigurerSupport extends PropertyResourceConfigurer	implements BeanNameAware, BeanFactoryAware {
  private beanFactory?: BeanFactory
  private beanName?: string
	protected trimValues = false
	protected nullValue: string | undefined
	protected ignoreUnresolvablePlaceholders = false


  setBeanFactory(beanFactory: BeanFactory): void {
		this.beanFactory = beanFactory
  }

  setBeanName(beanName: string): void {
		this.beanName = beanName
  }

  protected doProcessProperties(beanFactoryToProcess: ConfigurableListableBeanFactory, valueResolver: StringValueResolver) {
    const visitor = new BeanDefinitionVisitor(valueResolver)

		const beanNames = beanFactoryToProcess.getBeanDefinitionNames()
		for (const curName of beanNames) {
			// Check that we're not parsing our own bean definition,
			// to avoid failing on unresolvable placeholders in properties file locations.
			if (!(curName == this.beanName && beanFactoryToProcess == this.beanFactory)) {
				const bd = beanFactoryToProcess.getBeanDefinition(curName)
				try {
					visitor.visitBeanDefinition(bd)
				} catch (ex) {
					throw new BeanDefinitionStoreException(bd.getResourceDescription(), curName, ex.getMessage(), ex)
				}
			}
		}

		// New in Spring 2.5: resolve placeholders in alias target names and aliases as well.
		beanFactoryToProcess.resolveAliases(valueResolver)

		// New in Spring 3.0: resolve placeholders in embedded values such as annotation attributes.
		beanFactoryToProcess.addEmbeddedValueResolver(valueResolver)
  }
}
