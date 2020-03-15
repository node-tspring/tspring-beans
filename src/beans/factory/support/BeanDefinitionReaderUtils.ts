import { BeanDefinitionHolder } from '../config/BeanDefinitionHolder'
import { BeanDefinitionRegistry } from './BeanDefinitionRegistry'

export abstract class BeanDefinitionReaderUtils {
  static registerBeanDefinition(definitionHolder: BeanDefinitionHolder, registry: BeanDefinitionRegistry) {

    // Register bean definition under primary name.
    const beanName = definitionHolder.getBeanName()
    registry.registerBeanDefinition(beanName, definitionHolder.getBeanDefinition())

    // Register aliases for bean name, if any.
    const aliases = definitionHolder.getAliases()
    if (aliases != undefined) {
      for (const alias of aliases) {
        // registry.registerAlias(beanName, alias)
      }
    }
  }
}
