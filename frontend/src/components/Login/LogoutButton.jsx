import React from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutButton({ onLogout }) {
    const navigate = useNavigate();
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${VITE_API_BASE_URL}/api/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                localStorage.removeItem('authToken');
                if (onLogout) {
                    onLogout();
                }
                navigate('/');
            } else {
                console.error('Error al cerrar sesión');
            }
        } catch (error) {
            console.error('Error al comunicarse con el servidor para cerrar sesión:', error);
        }
    };

    return (
        <button onClick={handleLogout} className="text-blue-500 hover:underline">
            Cerrar Sesión
        </button>
    );
}

export default LogoutButton;