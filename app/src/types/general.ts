export type PickStartsWith<T extends object, S extends string> = {
  [K in keyof T as K extends `${S}${infer R}` ? K : never]: T[K]
}

export type OmitStartsWith<T extends object, S extends string> = {
  [K in keyof T as K extends `${S}${infer R}` ? never : K]: T[K]
}