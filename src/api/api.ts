import axios, { AxiosError } from 'axios'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { ApiError } from './models'

export function get<T>(url: string): Promise<E.Either<ApiError, T>> {
  return TE.tryCatch(
    () => axios.get<T>(url).then((response) => response.data),
    (error) => transformError(error as Error | AxiosError)
  )()
}

function transformError(error: Error | AxiosError): ApiError {
  if (axios.isAxiosError(error)) {
    return `Axios error: ${error.name}\n${error.message}\n${JSON.stringify(
      error.toJSON()
    )}`
  } else {
    return `Error: ${error.name}\n${error.message}\n${error.stack}\n${error.cause}`
  }
}
