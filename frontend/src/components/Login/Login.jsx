import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        try {
            const response = await fetch(`${VITE_API_BASE_URL}/api/login`, {
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
                return;
            }

            const data = await response.json();
            localStorage.setItem('authToken', data.access_token);
            localStorage.setItem('userRole', data.rol);
            navigate('/');
        } catch (error) {
            setError('Error de conexión con el servidor');
            console.error('Login error:', error);
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
                        autoComplete="email"
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