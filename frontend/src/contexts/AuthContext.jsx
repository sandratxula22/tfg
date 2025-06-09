import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import Swal from 'sweetalert2';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const checkAuthStatus = useCallback(async () => {
        setLoadingAuth(true);
        const authToken = localStorage.getItem('authToken');

        if (!authToken) {
            setIsAuthenticated(false);
            setUserRole(null);
            setLoadingAuth(false);
            return;
        }

        try {
            const response = await fetch(`/api/user`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setIsAuthenticated(true);
                setUserRole(data.rol);
            } else {
                localStorage.removeItem('authToken');
                setIsAuthenticated(false);
                setUserRole(null);
                Swal.fire({
                    icon: 'error',
                    title: 'Sesión Expirada',
                    text: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.'
                });
            }
        } catch (error) {
            console.error('Error al verificar el estado de autenticación:', error);
            setIsAuthenticated(false);
            setUserRole(null);
            Swal.fire({
                icon: 'error',
                title: 'Error de Red',
                text: 'No se pudo conectar al servidor para verificar tu sesión.'
            });
        } finally {
            setLoadingAuth(false);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();

        const handleStorageChange = () => {
            checkAuthStatus();
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [checkAuthStatus]);

    const logout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setUserRole(null);
        window.dispatchEvent(new Event('storage'));
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userRole, loadingAuth, logout, checkAuthStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};