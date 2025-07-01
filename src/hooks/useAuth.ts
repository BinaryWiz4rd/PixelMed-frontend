import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthResult {
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    error: string | null;
    isLoading: boolean;
}

const useAuth = (): AuthResult => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const login = async (username: string, password: string) => {
        setError(null);
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed... please check your credentials.');
            }

            const data = await response.json();
            if (data.token) {
                localStorage.setItem('jwtToken', data.token);
            }
            navigate('/home');
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'An unexpected error occurred, please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('jwtToken');
        navigate('/');
    };

    return { login, logout, error, isLoading };
};

export default useAuth;
