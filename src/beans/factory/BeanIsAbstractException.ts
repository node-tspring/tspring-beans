import { BeanCreationException } from './BeanCreationException'

export class BeanIsAbstractException extends BeanCreationException {
  constructor(beanName: string) {
		super(undefined, beanName, 'Bean definition is abstract')
	}
}
