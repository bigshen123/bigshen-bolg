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
        try {
            const result = await apiCall();
            if (!result) {
                setError('请求失败，请稍后重试');
            }
            return result;
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr?.response?.data?.message || '请求发生错误');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, call, setError };
};
