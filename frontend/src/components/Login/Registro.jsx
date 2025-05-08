import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Registro() {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [direccion, setDireccion] = useState('');
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            const response = await fetch(`${VITE_API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre,
                    apellido,
                    direccion,
                    correo,
                    contrasena,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                 if (errorData.errors) {
                    let errorMessage = '';
                    for (const key in errorData.errors) {
                        errorMessage += `${key}: ${errorData.errors[key].join(', ')}\n`;
                    }
                    setError(errorMessage.trim());
                } else {
                    setError(errorData.message || 'Error al registrar usuario');
                }
                return;
            }

            const data = await response.json();
            localStorage.setItem('authToken', data.access_token);
            navigate('/login');
        } catch (error) {
            setError('Error de conexión con el servidor');
            console.error('Registration error:', error);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-2xl font-bold mb-4">Registro</h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
                <div className="mb-4">
                    <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">Nombre:</label>
                    <input
                        type="text"
                        id="nombre"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="apellido" className="block text-gray-700 text-sm font-bold mb-2">Apellido:</label>
                    <input
                        type="text"
                        id="apellido"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="direccion" className="block text-gray-700 text-sm font-bold mb-2">Dirección:</label>
                    <input
                        type="text"
                        id="direccion"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        required
                    />
                </div>
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
                <div className="mb-4">
                    <label htmlFor="contrasena" className="block text-gray-700 text-sm font-bold mb-2">Contraseña:</label>
                    <input
                        type="password"
                        id="contrasena"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                        required
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                        Registrarse
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Registro;
