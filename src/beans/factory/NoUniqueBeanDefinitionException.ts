import { NoSuchBeanDefinitionException } from './NoSuchBeanDefinitionException'

export class NoUniqueBeanDefinitionException extends NoSuchBeanDefinitionException {
  constructor (msg: string, arg2: any) {
    super(msg)
  }
}
