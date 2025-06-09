import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

function Login() {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const { checkAuthStatus } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        try {
            const response = await fetch(`/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    correo,
                    contrasena,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || 'Error al iniciar sesión');
                Swal.fire({
                    icon: 'error',
                    title: 'Error de inicio de sesión',
                    text: errorData.message || 'Credenciales incorrectas.',
                });
                return;
            }

            const data = await response.json();
            localStorage.setItem('authToken', data.access_token);

            Swal.fire({
                icon: 'success',
                title: '¡Inicio de sesión exitoso!',
                showConfirmButton: false,
                timer: 1500
            });

            await checkAuthStatus();

            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });

        } catch (error) {
            setError('Error de conexión con el servidor');
            console.error('Login error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo conectar al servidor. Inténtalo de nuevo más tarde.',
            });
        }
    };

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
                <div className="mb-4">
                    <label htmlFor="correo" className="block text-gray-700 text-sm font-bold mb-2">Correo:</label>
                    <input
                        type="email"
                        id="correo"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        autoComplete="email"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="contrasena" className="block text-gray-700 text-sm font-bold mb-2">Contraseña:</label>
                    <input
                        type="password"
                        id="contrasena"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                        Iniciar Sesión
                    </button>
                    <Link to="/registro" className="inline-block align-baseline font-semibold text-sm text-blue-500 hover:text-blue-800">
                        ¿No tienes cuenta? Regístrate
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default Login;