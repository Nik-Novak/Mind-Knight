import { useState, useCallback, SetStateAction, Dispatch } from "react";

// type Middleware<I, O> = (input: I) => Promise<O>;

// type MiddlewareList<
//    T extends readonly any[],
//    M extends readonly Middleware<any, any>[] = []
// > = T extends readonly [infer T0, infer T1, ...infer R] ?
//     MiddlewareList<[T1, ...R], [...M, Middleware<T0, T1>]> :
//     M

// let middleware:MiddlewareList<> = [];
type FetchFunction<T, P extends unknown[]> = (...args: P) => Promise<T>;
type Options = {
  isInitiallyFetching?: boolean;
  noRecurringIsFetching?: boolean;
};
/**
 *
 * @param fetchFunc
 * @param initialValue
 * @param {Object} options Options
 * @param {boolean} options.isInitiallyFetching Default true; Sets whether isFetching is initially true upon instantiation
 * @param {boolean} options.noRecurringIsFetching Default: false; If set to true, data fetches after data is received will not set isFetching to true
 * @returns
 */
function useFetch<T, P extends unknown[]>(
  fetchFunc: FetchFunction<T, P>,
  initialValue: T,
  options: Options = { isInitiallyFetching: true, noRecurringIsFetching: false }
): [T, (...args: P) => Promise<T>, boolean, string | undefined, Dispatch<SetStateAction<T>>] {
  const [data, setData] = useState<T>(initialValue);
  const [isFetching, setIsFetching] = useState<boolean>(!!options.isInitiallyFetching);
  const [error, setError] = useState();

  const fetchData = useCallback(
    async (...args: P) => {
      if (data == initialValue || !options.noRecurringIsFetching)
        // NOT ( data !== initialValue && options.noRecurringIsFetching )
        setIsFetching(true);
      try {
        setError(undefined);
        const result = fetchFunc(...args); //await fetchFunc(...args);
        let middleware: ((...args:any[]) => Promise<any>)[] = [];
        let transformedResult = await middleware.reduce(async (previousResultMemo, currentMiddleware) => {
          let previousResult = await previousResultMemo;
          return previousResult;
        }, result);
        setData(transformedResult);
        setIsFetching(false);
        return result;
      } catch (error: any) {
        console.error(`Error fetching data: ${error}`);
        setError(error.message);
        setIsFetching(false);
        throw error;
      }
    },
    [fetchFunc]
  );
  return [data, fetchData, isFetching, error, setData];
}

export default useFetch;
