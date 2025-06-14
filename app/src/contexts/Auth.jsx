import { createContext, useState, useContext } from 'react';
import { API_URL } from '../App';

const Auth = createContext();
export const useAuth = () => useContext(Auth);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); 
    const [bearerToken, setBearerToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
  
    const login = (userData) => {
        setUser(userData);
        setBearerToken(userData.data.bearerToken.token);
        setRefreshToken(userData.data.refreshToken.token);
    };
  
    const logout = async(e) => {
        e.preventDefault();
    
        try {
            const response = await fetch(`${API_URL}/user/logout`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json',},
                body: JSON.stringify({ refreshToken }),
            });
    
            const data = await response.json();
            
            if (response.ok) {
                console.log('logout success!: ', data);
            } else 
                console.error('logout error: ', response.message);
    
        } catch (err) {
            console.error('logout error: ', err);
        }
        setUser(null);
        setBearerToken(null);
        setRefreshToken(null);
    }
  
    const refreshBearer = async() => {
        try {
            return await fetch(`${API_URL}/user/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    refreshToken, 
                }),
            });
        } catch (err) {
            console.error('token refresh error: ', err);
        }
    };

    const authFetch = async (url, options = {}) => {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    Authorization: `Bearer ${bearerToken}`,
                    'Content-Type': 'application/json'
                },
            });

            if (response.status != 401) return response;
            const refreshResponse = await refreshBearer();

            if (!refreshResponse.ok) {
                logout();
                throw new Error('failed to refresh token');
            }

            const refreshData = await refreshResponse.json();

            setBearerToken(refreshData.bearerToken.token);
            setRefreshToken(refreshData.refreshToken.token);

            const retryResponse = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    Authorization: `Bearer ${refreshData.bearerToken.token}`,
                    'Content-Type': 'application/json'
                },
            });

            return retryResponse;

        } catch (err) {
            console.error('authFetch error: ', err);
        }
    };
  
    return (
        <Auth.Provider value={{ user, login, logout, authFetch }}>
            {children}
        </Auth.Provider>
    );
  };