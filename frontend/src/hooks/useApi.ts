import { useState, useCallback } from 'react';

/**
 * 通用API调用Hook
 */
export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const call = useCallback(async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        if (!result) {
            setError('请求失败，请稍后重试');
        }
        setLoading(false);
        return result;
    }, []);

    return { loading, error, call, setError };
};
