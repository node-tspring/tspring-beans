import { BeanCreationException } from './BeanCreationException'

export class BeanCurrentlyInCreationException extends BeanCreationException {
  constructor (beanName: string, msg?: string) {
    super(undefined, beanName, msg)
  }
}
