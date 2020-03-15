import { AbstractBeanDefinition } from './AbstractBeanDefinition'
import { BeanDefinition } from '../config/BeanDefinition'

export class GenericBeanDefinition extends AbstractBeanDefinition {
  private parentName?: string

  constructor()
  constructor(original: BeanDefinition)

  constructor(arg1?: any) {
    super(arg1)
  }

  cloneBeanDefinition(): AbstractBeanDefinition {
    throw new Error('cloneBeanDefinition +++ sMethod not implemented.')
  }

  setParentName(parentName: string): void {
    this.parentName = parentName
  }

  getParentName(): string {
    return this.parentName!
  }

  // cloneBeanDefinition(): AbstractBeanDefinition {
  //   return new GenericBeanDefinition(this)
  // }

  // equals(other: any): boolean {
  // 	return (this == other || (other instanceof GenericBeanDefinition && super.equals(other)))
  // }

  toString(): string {
    let result = 'Generic bean'
    if (this.parentName != undefined) {
      result += ` with parent '${this.parentName}'`
    }
    result += `: ${super.toString()}`
    return result
  }

}
