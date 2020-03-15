import { BeansException } from '../BeansException'
import { Class } from '@tspring/core'

export class NoSuchBeanDefinitionException extends BeansException {
  private beanName: string
  private resolvableType: Class<Object>

  constructor(name: string)
  constructor(name: string, message: string)
  constructor(type: Class<Object>)
  constructor(type: Class<Object>, message: string)

  constructor(arg1: string | Class<Object>, message?: string) {
    super()
    let name: string
    let resolvableType: Class<Object>
    let msg
    if (typeof arg1 == 'string') {
      name = arg1
      resolvableType = undefined as any
      msg = `No bean named '${name}' available`
    } else {
      name = undefined as any
      resolvableType = arg1
      msg = `No qualifying bean of type '${resolvableType.name}' available"`
    }
    if (message != undefined) {
      msg += `: ${message}`
    }
		this.beanName = name
    this.resolvableType = resolvableType
    this.setMessage(msg)
  }

	getBeanName() {
    return this.beanName
  }

	getBeanType() {
    return this.resolvableType
  }

	getNumberOfBeansFound() {
    return 0
  }
}
