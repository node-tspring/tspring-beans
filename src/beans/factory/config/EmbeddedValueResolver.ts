import { StringValueResolver, Implements } from '@tspring/core'
import { BeanExpressionContext } from './BeanExpressionContext'
import { ConfigurableBeanFactory } from './ConfigurableBeanFactory'
import { BeanExpressionResolver } from './BeanExpressionResolver'

@Implements(StringValueResolver)
export class EmbeddedValueResolver implements StringValueResolver {
  private exprContext: BeanExpressionContext
  private exprResolver: BeanExpressionResolver | undefined

  constructor(beanFactory: ConfigurableBeanFactory) {
		this.exprContext = new BeanExpressionContext(beanFactory, undefined)
		this.exprResolver = beanFactory.getBeanExpressionResolver()
  }

  resolveStringValue(strVal: string): string | undefined {
    let value = this.exprContext.getBeanFactory().resolveEmbeddedValue(strVal)
		if (this.exprResolver != undefined && value != undefined) {
			const evaluated = this.exprResolver.evaluate(value, this.exprContext)
			value = (evaluated != undefined ? evaluated.toString() : undefined)
		}
		return value
  }

  resolveObjectValue(strVal: string) {
    return strVal
  }
}
