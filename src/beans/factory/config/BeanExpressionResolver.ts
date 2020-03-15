import { BeanExpressionContext } from './BeanExpressionContext'
import { Interface } from '@tspring/core'

export interface BeanExpressionResolver {
	evaluate(value: string | undefined, evalContext: BeanExpressionContext): Object | undefined
}

export const BeanExpressionResolver = new Interface('BeanExpressionResolver')
