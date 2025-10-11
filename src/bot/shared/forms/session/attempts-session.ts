import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import type { AttemptsState } from '../plugins/attempts.js'

export const ATTEMPTS_SESSION_KEY = '__formAttempts' as const

type AttemptsSessionData = {
  [ATTEMPTS_SESSION_KEY]?: AttemptsState
}

export type AttemptsSession = {
  read: () => Promise<AttemptsState | undefined>
  write: (state: AttemptsState) => Promise<void>
  clear: (stepId: string) => Promise<void>
}

export function getAttemptsSession<TContext extends Context>(
  conversation: Conversation<TContext, TContext>,
  stepId: string,
): AttemptsSession {
  const read = async () => {
    return await conversation.external((ctx) => {
      const session = ctx.session as AttemptsSessionData
      const state = session[ATTEMPTS_SESSION_KEY]
      if (!state || state.stepId !== stepId) {
        return undefined
      }
      return state
    })
  }

  const write = async (state: AttemptsState) => {
    await conversation.external((ctx) => {
      const session = ctx.session as AttemptsSessionData
      session[ATTEMPTS_SESSION_KEY] = state
    })
  }

  const clear = async (expectedStepId: string) => {
    await conversation.external((ctx) => {
      const session = ctx.session as AttemptsSessionData
      const state = session[ATTEMPTS_SESSION_KEY]
      if (state?.stepId === expectedStepId) {
        delete session[ATTEMPTS_SESSION_KEY]
      }
    })
  }

  return { read, write, clear }
}
