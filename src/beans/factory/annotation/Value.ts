import { Annotation, ElementType } from '@tspring/core'

type AnnotationParams = {
  value: any
} & Annotation.Params<any>

export const Value = Annotation.define<ElementType.METHOD & ElementType.FIELD & ElementType.PARAMETER, string, AnnotationParams>({
  name: 'Value'
})

export module Value {
  export type Params = AnnotationParams
}
