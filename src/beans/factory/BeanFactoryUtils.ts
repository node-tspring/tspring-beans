import { BeanFactory } from './BeanFactory'
import { ListableBeanFactory } from './ListableBeanFactory'
import { Class, isImplements } from '@tspring/core'
import { HierarchicalBeanFactory } from './HierarchicalBeanFactory'

const transformedBeanNameCache = new Map<string, string>()

export abstract class BeanFactoryUtils {

  static isFactoryDereference (name: string) {
		return (name != undefined && name.startsWith(BeanFactory.FACTORY_BEAN_PREFIX))
	}

	static transformedBeanName (name: string) {
		if (!name.startsWith(BeanFactory.FACTORY_BEAN_PREFIX)) {
			return name
		}

		let cacheVal = transformedBeanNameCache.get(name)
		if (cacheVal) {
			return cacheVal
		} else {
			cacheVal = name
			do {
				cacheVal = cacheVal.substring(BeanFactory.FACTORY_BEAN_PREFIX.length)
			} while (cacheVal.startsWith(BeanFactory.FACTORY_BEAN_PREFIX))
			transformedBeanNameCache.set(name, cacheVal)
			return cacheVal
		}
	}

	static beanNamesForTypeIncludingAncestors(lbf: ListableBeanFactory, type: Class<Object>, includeNonSingletons: boolean, allowEagerInit: boolean) {
		let result = lbf.getBeanNamesForType(type, includeNonSingletons, allowEagerInit)
		if (isImplements<HierarchicalBeanFactory>(lbf, HierarchicalBeanFactory)) {
			const hbf = lbf
			if (isImplements<ListableBeanFactory>(hbf.getParentBeanFactory(), ListableBeanFactory)) {
				const parentResult = this.beanNamesForTypeIncludingAncestors(hbf.getParentBeanFactory() as ListableBeanFactory, type, includeNonSingletons, allowEagerInit)
				result = BeanFactoryUtils.mergeNamesWithParent(result, parentResult, hbf)
			}
		}
		return result
	}

	private static mergeNamesWithParent(result: string[], parentResult: string[], hbf: HierarchicalBeanFactory) {
		if (parentResult.length == 0) {
			return result
		}
		const merged: string[] = []
		merged.push(...result)
		for (const beanName of parentResult) {
			if (merged.indexOf(beanName) == -1 && !hbf.containsLocalBean(beanName)) {
				merged.push(beanName)
			}
		}
		return merged
	}
}
