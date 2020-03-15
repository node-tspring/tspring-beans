import { Annotation, ElementType } from '@tspring/core'

type AnnotationParams = {
  required: boolean
} & Annotation.Params<boolean>

export const Autowired = Annotation.define<ElementType.METHOD & ElementType.FIELD & ElementType.PARAMETER, boolean, AnnotationParams>({
  name: 'Autowired',
  attributes: {
    required: {
      default: true
    }
  }
})

export module Autowired {
  export type Params = AnnotationParams
}
