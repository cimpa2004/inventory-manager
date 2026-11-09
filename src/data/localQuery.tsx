import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type QueryKey = string;
type QueryListener = () => void;

type QueryState<T> = {
  data?: T;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
};

type QueryEntry<T> = QueryState<T> & {
  listeners: Set<QueryListener>;
  queryFn?: () => Promise<T>;
  promise?: Promise<T>;
};

export type LocalQueryResult<T> = QueryState<T> & {
  refetch: () => Promise<T | undefined>;
};

export type LocalMutationResult<TInput, TOutput> = {
  mutateAsync: (input: TInput) => Promise<TOutput>;
  isPending: boolean;
  error: Error | null;
  reset: () => void;
};

export type LocalQueryClient = {
  invalidateQueries: (queryKey: QueryKey) => Promise<void>;
};

type QueryClient = LocalQueryClient & {
  getEntry: <T>(queryKey: QueryKey) => QueryEntry<T>;
  fetchQuery: <T>(
    queryKey: QueryKey,
    queryFn: () => Promise<T>,
  ) => Promise<T>;
};

const QueryClientContext = createContext<QueryClient | null>(null);

function createQueryClient(): QueryClient {
  const entries = new Map<QueryKey, QueryEntry<unknown>>();

  const notify = (entry: QueryEntry<unknown>) => {
    entry.listeners.forEach((listener) => listener());
  };

  const getEntry = <T,>(queryKey: QueryKey): QueryEntry<T> => {
    const existing = entries.get(queryKey);
    if (existing) {
      return existing as QueryEntry<T>;
    }

    const entry: QueryEntry<T> = {
      data: undefined,
      error: null,
      isLoading: true,
      isFetching: false,
      listeners: new Set(),
    };
    entries.set(queryKey, entry as QueryEntry<unknown>);
    return entry;
  };

  const fetchQuery = <T,>(
    queryKey: QueryKey,
    queryFn: () => Promise<T>,
  ): Promise<T> => {
    const entry = getEntry<T>(queryKey);
    entry.queryFn = queryFn;
    if (entry.promise) {
      return entry.promise;
    }

    entry.isFetching = true;
    entry.error = null;
    notify(entry);
    entry.promise = queryFn()
      .then((data) => {
        entry.data = data;
        entry.isLoading = false;
        return data;
      })
      .catch((error: unknown) => {
        entry.error =
          error instanceof Error ? error : new Error('Query failed.');
        entry.isLoading = false;
        throw error;
      })
      .finally(() => {
        entry.isFetching = false;
        entry.promise = undefined;
        notify(entry);
      });

    return entry.promise;
  };

  return {
    getEntry,
    fetchQuery,
    invalidateQueries: async (queryKey) => {
      const entry = entries.get(queryKey);
      if (entry?.queryFn) {
        await fetchQuery(queryKey, entry.queryFn);
      }
    },
  };
}

export function LocalQueryProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => createQueryClient(), []);
  return (
    <QueryClientContext.Provider value={client}>
      {children}
    </QueryClientContext.Provider>
  );
}

export function useLocalQuery<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
): LocalQueryResult<T> {
  const client = useContext(QueryClientContext);
  if (!client) {
    throw new Error('useLocalQuery must be used inside LocalQueryProvider.');
  }

  const [, forceRender] = useState(0);
  const entry = getQueryEntry<T>(client, queryKey);
  entry.queryFn = queryFn;

  const refetch = useCallback(
    () => fetchQueryForClient(client, queryKey, queryFn),
    [client, queryFn, queryKey],
  );

  useEffect(() => {
    const listener = () => forceRender((value) => value + 1);
    entry.listeners.add(listener);
    if (entry.isLoading && !entry.promise) {
      void refetch();
    }
    return () => {
      entry.listeners.delete(listener);
    };
  }, [entry, forceRender, refetch]);

  return {
    data: entry.data,
    error: entry.error,
    isLoading: entry.isLoading,
    isFetching: entry.isFetching,
    refetch,
  };
}

export function useLocalMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>,
  invalidateKeys: QueryKey[] = [],
): LocalMutationResult<TInput, TOutput> {
  const client = useContext(QueryClientContext);
  if (!client) {
    throw new Error('useLocalMutation must be used inside LocalQueryProvider.');
  }

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(
    async (input: TInput) => {
      setIsPending(true);
      setError(null);
      try {
        const result = await mutationFn(input);
        await Promise.all(
          invalidateKeys.map((queryKey) => client.invalidateQueries(queryKey)),
        );
        return result;
      } catch (mutationError: unknown) {
        const normalizedError =
          mutationError instanceof Error
            ? mutationError
            : new Error('Mutation failed.');
        setError(normalizedError);
        throw normalizedError;
      } finally {
        setIsPending(false);
      }
    },
    [client, invalidateKeys, mutationFn],
  );

  const reset = useCallback(() => setError(null), []);

  return { mutateAsync, isPending, error, reset };
}

function getQueryEntry<T>(
  client: QueryClient,
  queryKey: QueryKey,
): QueryEntry<T> {
  return client.getEntry<T>(queryKey);
}

function fetchQueryForClient<T>(
  client: QueryClient,
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
): Promise<T> {
  return client.fetchQuery(queryKey, queryFn);
}
