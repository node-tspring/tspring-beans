import { FatalBeanException } from '../FatalBeanException'

export class BeanCreationException extends FatalBeanException {
	constructor(resourceDescription: string | undefined, beanName: string, msg?: string, cause?: Error) {
    super(`Error creating bean with name '${beanName}' ${resourceDescription != undefined ? ` defined in ${resourceDescription}` : ''}: ${msg}`, cause)
  }
}
