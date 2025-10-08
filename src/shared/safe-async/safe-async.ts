export async function safeAsync<T>(
  promise: Promise<T>,
): Promise<[error: Error | null, data: T | null]> {
  try {
    const data = await promise
    return [null, data]
  }
  catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err))
    return [error, null]
  }
}
