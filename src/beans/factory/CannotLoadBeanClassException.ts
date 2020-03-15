import { FatalBeanException } from '../FatalBeanException'

export class CannotLoadBeanClassException extends FatalBeanException {
  constructor(resourceDescription: string | undefined, beanName: string, beanClassName: string | undefined, cause: Error) {
    super(`Error loading class [${beanClassName}] for bean with name '${beanName}' ${resourceDescription != undefined ? ` defined in ${resourceDescription}` : ''}: problem with class file or dependent class`, cause)
  }
}
