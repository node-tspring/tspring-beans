import { BeanWrapper } from './BeanWrapper'
import { TypeDescriptor, Implements } from '@tspring/core'
import { AbstractSimplePropertyAccessor } from './AbstractSimplePropertyAccessor'
// import { AbstractNestablePropertyAccessor } from './AbstractNestablePropertyAccessor'

@Implements(BeanWrapper)
export class BeanWrapperImpl extends AbstractSimplePropertyAccessor implements BeanWrapper {
  constructor(object: Object) {
    super(object)
  }

  // private property(PropertyDescriptor pd): Property {
	// 	GenericTypeAwarePropertyDescriptor gpd = (GenericTypeAwarePropertyDescriptor) pd
	// 	return new Property(gpd.getBeanClass(), gpd.getReadMethod(), gpd.getWriteMethod(), gpd.getName())
  // }

  convertForProperty(value: any, propertyName: string) {
		// CachedIntrospectionResults cachedIntrospectionResults = getCachedIntrospectionResults()
		// PropertyDescriptor pd = cachedIntrospectionResults.getPropertyDescriptor(propertyName)
		// if (pd == undefined) {
		// 	throw new InvalidPropertyException(getRootClass(), getNestedPath() + propertyName,
		// 			"No property '" + propertyName + "' found")
		// }
    // const td = cachedIntrospectionResults.getTypeDescriptor(pd)
    let td: TypeDescriptor | undefined
		if (!td) {
			// td = cachedIntrospectionResults.addTypeDescriptor(pd, new TypeDescriptor(property(pd)))
			// td = new TypeDescriptor(this.property(pd))
		}
		return this.$convertForProperty(propertyName, undefined, value, td as any)
	}
}
