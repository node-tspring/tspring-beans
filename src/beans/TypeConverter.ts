import { Class, TypeDescriptor, Field, MethodParameter, Interface } from '@tspring/core'

export interface TypeConverter {
	convertIfNecessary<T>(value: any, requiredType?: Class<T>): T

	convertIfNecessary<T>(value: any, requiredType?: Class<T>, methodParam?: MethodParameter): T

	convertIfNecessary<T>(value: any, requiredType?: Class<T>, field?: Field): T

	convertIfNecessary<T>(value: any, requiredType?: Class<T>, typeDescriptor?: TypeDescriptor): T
}

export const TypeConverter = new Interface('TypeConverter')
