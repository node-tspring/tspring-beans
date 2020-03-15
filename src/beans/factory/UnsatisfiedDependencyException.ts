import { InjectionPoint } from './InjectionPoint'
import { BeansException } from '../BeansException'

export class UnsatisfiedDependencyException extends Error {
  constructor(
    resourceDescription: string | undefined,
    beanName: string | undefined,
    injectionPoint: InjectionPoint,
    private cause: BeansException
  ) {
    super()
  }
}
