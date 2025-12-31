import { useState, useCallback } from 'react';

export interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export interface UseApiOptions {
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

/**
 * Custom hook for handling API calls with loading and error states
 */
export function useApi<T = unknown>(options?: UseApiOptions) {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const execute = useCallback(
        async (apiCall: () => Promise<T>): Promise<T | null> => {
            setState({ data: null, loading: true, error: null });

            try {
                const data = await apiCall();
                setState({ data, loading: false, error: null });
                options?.onSuccess?.();
                return data;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An error occurred';
                setState({ data: null, loading: false, error: errorMessage });
                options?.onError?.(errorMessage);
                return null;
            }
        },
        [options]
    );

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return {
        ...state,
        execute,
        reset,
    };
}

/**
 * Custom hook for handling mutations (create, update, delete)
 */
export function useMutation<TData = unknown, TVariables = unknown>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options?: UseApiOptions
) {
    const [state, setState] = useState<ApiState<TData>>({
        data: null,
        loading: false,
        error: null,
    });

    const mutate = useCallback(
        async (variables: TVariables): Promise<TData | null> => {
            setState({ data: null, loading: true, error: null });

            try {
                const data = await mutationFn(variables);
                setState({ data, loading: false, error: null });
                options?.onSuccess?.();
                return data;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An error occurred';
                setState({ data: null, loading: false, error: errorMessage });
                options?.onError?.(errorMessage);
                return null;
            }
        },
        [mutationFn, options]
    );

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return {
        ...state,
        mutate,
        reset,
    };
}
