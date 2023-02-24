export interface AstNode<Type extends string> {
	type: Type
	// start: number
	// end: number
}

export interface AstClass extends AstNode<'Class'> {
	name: string
	base: string
	properties: AstProperty[]
}

export interface AstProperty extends AstNode<'Property'> {
	name: string
	mutable: boolean
	key?: string
	returns?: string
	value: AstExpression
}

export type AstExpression =
	| AstPrimitive
	| AstArray
	| AstRecord
	| AstObject
	| AstPropertyReference
	| AstProperty

export interface AstPrimitive extends AstNode<'Primitive'> {
	value: null | boolean | number | string
}

export interface AstPropertyReference extends AstNode<'PropertyReference'> {
	name: string
	key: boolean
	mutable: boolean
}

export interface AstArray extends AstNode<'Array'> {
	annotation?: string
	items: AstArrayItem[]
}

export interface AstArrayItem extends AstNode<'ArrayItem'> {
	value: AstExpression
}

export interface AstRecord extends AstNode<'Record'> {
	annotation?: {
		key: string
		value: string
	}
	items: AstRecordItem[]
}

interface AstRecordItem extends AstNode<'RecordItem'> {
	key: string
	value: AstExpression
}

export interface AstObject extends AstNode<'Object'> {
	class: string
	properties: AstObjectProperty[]
}

export type AstObjectProperty = AstObjectOverride | AstObjectAlias | AstObjectBinding

export interface AstObjectOverride extends AstNode<'ObjectOverride'> {
	name: string
	value: AstExpression
}

export interface AstObjectAlias extends AstNode<'ObjectAlias'> {
	source: string
	target: AstPropertyReference
}

export interface AstObjectBinding extends AstNode<'ObjectBinding'> {
	name: string
	source: AstPropertyReference
}

