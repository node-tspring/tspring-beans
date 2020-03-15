import { GenericTypeAwareAutowireCandidateResolver } from '../support/GenericTypeAwareAutowireCandidateResolver'
import { Annotation } from '@tspring/core'
import { Qualifier } from './Qualifier'
import { BeanDefinitionHolder } from '../config/BeanDefinitionHolder'
import { DependencyDescriptor } from '../config/DependencyDescriptor'
import { Autowired } from './Autowired'
import { Value } from './Value'

export class QualifierAnnotationAutowireCandidateResolver extends GenericTypeAwareAutowireCandidateResolver {
  private qualifierTypes = new Set<Annotation>()
  private valueAnnotationType: Annotation = Value

  constructor () {
    super()
		this.qualifierTypes.add(Qualifier)
  }

  addQualifierType(qualifierType: Annotation) {
		this.qualifierTypes.add(qualifierType)
	}

  setValueAnnotationType(valueAnnotationType: Annotation) {
		this.valueAnnotationType = valueAnnotationType
  }

  isAutowireCandidate(bdHolder: BeanDefinitionHolder, descriptor: DependencyDescriptor) {
    let match = super.isAutowireCandidate(bdHolder, descriptor)
		if (match) {
			// match = this.checkQualifiers(bdHolder, descriptor.getAnnotations())
			// if (match) {
			// 	const methodParam = descriptor.getMethodParameter()
			// 	if (methodParam != undefined) {
			// 		const method = methodParam.getMethod()
			// 		if (method == undefined || method.getReturnType() == undefined) {
			// 			match = this.checkQualifiers(bdHolder, methodParam.getMethodAnnotations())
			// 		}
			// 	}
			// }
		}
		return match
	}

  isRequired(descriptor: DependencyDescriptor) {
		if (!super.isRequired(descriptor)) {
			return false
		}
		const autowired = descriptor.getAnnotationParams<Autowired.Params>(Autowired)
		return (autowired == undefined || autowired.required)
	}

	hasQualifier(descriptor: DependencyDescriptor): boolean {
		for(const aqualifierType of this.qualifierTypes) {
			if (descriptor.getAnnotationParams(aqualifierType) != undefined) {
				return true
			}
		}
		return false
	}

	getSuggestedValue(descriptor: DependencyDescriptor): Object | undefined {
		let value = this.findValue(descriptor)
		if (value == undefined) {
			const methodParam = descriptor.getMethodParameter()
			if (methodParam != undefined) {
				// TODO: 查找参数上的 value
				// value = this.findValue(methodParam.getMethodAnnotations())
			}
		}
		return value
	}

	protected findValue(descriptor: DependencyDescriptor): Object | undefined {
		const params = descriptor.getAnnotationParams(this.valueAnnotationType)
		if (params != undefined) {
			return params.value
		}
		return undefined
	}
}
