import { FatalBeanException } from '../FatalBeanException'

export class BeanDefinitionStoreException extends FatalBeanException {
  constructor(resourceDescription: string | undefined, beanName: string, msg: string, cause?: Error) {
    super(msg, cause)
  }
}
