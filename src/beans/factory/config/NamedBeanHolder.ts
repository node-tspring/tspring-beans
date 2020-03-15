export class NamedBeanHolder<T extends Object> {

  constructor(private beanName: string, private beanInstance: T) {

  }

	/**
	 * Return the name of the bean.
	 */
	getBeanName(): string {
		return this.beanName
	}

	/**
	 * Return the corresponding bean instance.
	 */
	getBeanInstance(): T {
		return this.beanInstance
	}
}
