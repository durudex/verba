export interface AstClass {
  name: string
  base: string
  properties: Array<AstProperty>
}

export type AstProperty = {
  name: string
  initializer: AstInitializer
  isKey: boolean
  isDict: boolean
}
export type AstPropertyReference = { property: string }

export type AstPrimitive = | string | number | boolean | null
export type AstRecord = {
  annotation: {
    key: string
    value: String
  },
  value: Map<string, AstExpression>
}
export type AstArray = {
  annotation: string
  value: AstExpression[]
}
export type AstInitializer =
  | AstPrimitive 
  | AstArray
  | AstRecord
export type AstExpression = | AstInitializer | AstPropertyReference | AstProperty
