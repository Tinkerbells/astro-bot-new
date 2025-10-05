export async function safe<T>(
  promise: Promise<T>,
): Promise<[Error | null, T | null]> {
  try {
    const data = await promise
    return [null, data]
  }
  catch (err) {
    return [err as Error, null]
  }
}
