export class BeanDefinitionDefaults {
  private lazyInit?: boolean
  private initMethodName?: string
  private destroyMethodName?: string

  getDestroyMethodName(): string | undefined {
    return this.destroyMethodName
  }

  getInitMethodName(): string | undefined {
    return this.initMethodName
  }

  isLazyInit () {
    return this.lazyInit != undefined && this.lazyInit
  }

  getLazyInit(): boolean | undefined {
    return this.lazyInit
  }

  setLazyInit(lazyInit: boolean) {
    this.lazyInit = lazyInit
  }

}
