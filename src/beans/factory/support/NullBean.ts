export class NullBean {
  equals(obj: any) {
		return (this == obj || obj == null)
  }

  toString() {
    return 'null'
  }
}
