import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './AdminPanel.css';

function AdminPanel() {
    const userRole = localStorage.getItem('userRole');
    const navigate = useNavigate();

    useEffect(() => {
        if (userRole !== 'admin') {
            navigate('/');
        }
    }, [userRole, navigate]);

    if (userRole !== 'admin') {
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-64 bg-gray-200 p-4">
                <h3 className="text-xl font-semibold mb-4">Panel de admin</h3>
                <nav>
                    <ul className="space-y-2">
                        <li>
                            <Link to="/admin/libros" className="admin-link block p-2 rounded hover:bg-gray-300">Libros</Link>
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