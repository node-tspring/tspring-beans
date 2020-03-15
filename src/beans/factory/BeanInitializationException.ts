export class BeanInitializationException extends Error {
  constructor(
    msg: string | undefined,
    private cause?: Error
  ) {
    super(msg)
  }
}
