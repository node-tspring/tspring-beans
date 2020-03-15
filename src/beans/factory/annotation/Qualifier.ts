import { Annotation, ElementType } from '@tspring/core'

type AnnotationParams = {} & Annotation.Params<string>

export const Qualifier = Annotation.define<ElementType.METHOD & ElementType.FIELD, string, AnnotationParams>({
  name: 'Qualifier',
  attributes: {
    value: {
      default: ''
    }
  }
})

export module Qualifier {
  export type Params = AnnotationParams
}
