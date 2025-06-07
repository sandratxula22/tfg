import React, { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';
import './AdminPanel.css';

function AdminPanel() {
    const { isAuthenticated, userRole, loadingAuth } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (loadingAuth) {
            return;
        }

        if (!isAuthenticated || userRole !== 'admin') {
            Swal.fire({
                icon: 'error',
                title: 'Acceso Denegado',
                text: 'No tienes permisos de administrador o tu sesión ha expirado.',
                timer: 2000
            });
            if (!isAuthenticated) {
                navigate('/login', { replace: true, state: { from: window.location.pathname } });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [loadingAuth, isAuthenticated, userRole, navigate]);

    if (loadingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando autorización...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || userRole !== 'admin') {
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