import React, { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './AdminPanel.css';

function AdminPanel() {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const navigate = useNavigate();
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const checkUserAuthorization = useCallback(async () => {
        const authToken = localStorage.getItem('authToken');

        if (!authToken) {
            setIsAuthorized(false);
            navigate('/login', { replace: true, state: { from: window.location.pathname } });
            return;
        }

        try {
            const response = await fetch(`${VITE_API_BASE_URL}/api/user`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.rol === 'admin') {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                    Swal.fire({
                        icon: 'error',
                        title: 'Acceso Denegado',
                        text: 'No tienes permisos de administrador.',
                        timer: 2000
                    });
                    navigate('/', { replace: true });
                }
            } else if (response.status === 401) {
                setIsAuthorized(false);
                Swal.fire({
                    icon: 'error',
                    title: 'Sesión Expirada',
                    text: 'Tu sesión ha expirado o es inválida. Por favor, inicia sesión de nuevo.',
                    timer: 2000
                });
                localStorage.removeItem('authToken');
                navigate('/login', { replace: true, state: { from: window.location.pathname } });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al verificar el rol del usuario.');
            }
        } catch (error) {
            console.error('Error durante la verificación de autorización:', error);
            setIsAuthorized(false);
            Swal.fire({
                icon: 'error',
                title: 'Error de Conexión',
                text: 'No se pudo verificar tu autorización. Inténtalo de nuevo más tarde.',
                timer: 3000
            });
            navigate('/', { replace: true });
        }
    }, [navigate, VITE_API_BASE_URL]);

    useEffect(() => {
        checkUserAuthorization();
    }, [checkUserAuthorization]);

    if (isAuthorized === null) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando autorización...</span>
                </div>
            </div>
        );
    }

    if (isAuthorized === false) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="w-64 bg-gray-200 p-4">
                <h3 className="text-xl font-semibold mb-4">Panel de admin</h3>
                <nav>
                    <ul className="space-y-2">
                        <li>
                            <Link to="/admin/libros" className="admin-link block p-2 rounded hover:bg-gray-300">Libros</Link>
                        </li>
                        <li>
                            <Link to="/admin/imagenes" className="admin-link block p-2 rounded hover:bg-gray-300">Imágenes</Link>
                        </li>
                        <li>
                            <Link to="/admin/usuarios" className="admin-link block p-2 rounded hover:bg-gray-300">Usuarios</Link>
                        </li>
                    </ul>
                </nav>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                <Outlet />
            </div>
        </div>
    );
}

export default AdminPanel;