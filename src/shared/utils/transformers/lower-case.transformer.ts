import type { TransformFnParams } from 'class-transformer'

import type { MaybeType } from '#root/shared/types/maybe.type.js'

export function lowerCaseTransformer(params: TransformFnParams): MaybeType<string> {
  return params.value?.toLowerCase().trim()
}
