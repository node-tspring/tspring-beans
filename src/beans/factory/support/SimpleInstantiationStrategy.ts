import { InstantiationStrategy } from './InstantiationStrategy'
import { BeanFactory } from '../BeanFactory'
import { RootBeanDefinition } from './RootBeanDefinition'
import { Implements } from '@tspring/core'

@Implements(InstantiationStrategy)
export class SimpleInstantiationStrategy implements InstantiationStrategy {

  instantiate(bd: RootBeanDefinition, beanName: string, owner: BeanFactory): Object
  instantiate(bd: RootBeanDefinition, beanName: string, owner: BeanFactory, ctor: any, ...args: any[]): Object
  instantiate(bd: RootBeanDefinition, beanName: string, owner: BeanFactory, factoryBean: Object, factoryMethod: any, ...args: any[]): Object
  instantiate(bd: RootBeanDefinition, beanName: string, ...arg3: any[]) {
    const Clazz = bd.getBeanClass()
    return new Clazz()
  }

}
