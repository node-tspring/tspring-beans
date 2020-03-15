import { Interface } from '@tspring/core'

export interface DisposableBean {
	destroy(): void
}

export const DisposableBean = new Interface('DisposableBean')
