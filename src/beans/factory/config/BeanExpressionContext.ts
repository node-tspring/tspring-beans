import { ConfigurableBeanFactory } from './ConfigurableBeanFactory'
import { Scope } from './Scope'

export class BeanExpressionContext {
  constructor (private beanFactory: ConfigurableBeanFactory, private scope: Scope | undefined ) {
  }

  getBeanFactory() {
		return this.beanFactory
	}
}
