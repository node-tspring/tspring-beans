import { PropertyEditorRegistrySupport } from './PropertyEditorRegistrySupport'

export class TypeConverterDelegate {
  private propertyEditorRegistry: PropertyEditorRegistrySupport
  private targetObject: any

  constructor(propertyEditorRegistry: PropertyEditorRegistrySupport, targetObject?: any) {
    this.propertyEditorRegistry = propertyEditorRegistry
		this.targetObject = targetObject
  }
}
