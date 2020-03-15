export abstract class BeansException extends Error {
  constructor(msg?: string, private cause?: Error) {
		super(msg)
  }

  protected setMessage(msg: string) {
    this.message = msg
  }
}
