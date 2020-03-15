import { PropertyEditorRegistry } from './PropertyEditorRegistry'
import { ConversionService, Implements } from '@tspring/core'

@Implements(PropertyEditorRegistry)
export class PropertyEditorRegistrySupport implements PropertyEditorRegistry {
	private conversionService?: ConversionService
	private defaultEditorsActive = false

  setConversionService(conversionService: ConversionService | undefined): void {
    this.conversionService = conversionService
  }

  protected registerDefaultEditors() {
		this.defaultEditorsActive = true
	}
}
