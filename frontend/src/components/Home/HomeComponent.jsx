import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
    const [libros, setLibros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const apiUrl = `${VITE_API_BASE_URL}/api/libros`;
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setLibros(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="text-center py-4">Cargando libros...</div>;
    }

    if (error) {
        return <div className="text-red-500 py-4">Error al cargar los libros: {error.message}</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Libros Reencuadernados</h1>
            {libros.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {libros.map(libro => (

                        <div key={libro.id} className="border rounded-lg shadow-md p-4 flex flex-col h-full">
                            {libro.imagen_portada && (
                                <img
                                src={`${import.meta.env.VITE_API_BASE_URL}/portadas/${libro.imagen_portada}`}
                                    alt={`Portada de ${libro.titulo}`}
                                    className="w-full object-cover mb-4 rounded"
                                />
                            )}
                            <h4 className="text-xl font-semibold mb-2">{libro.titulo}</h4>
                            <p className="text-gray-700">Autor: {libro.autor}</p>
                            <p className="text-gray-700">Género: {libro.genero}</p>
                            <p className="text-gray-700">Precio: {libro.precio}€</p>
                            <Link to={`/libro/${libro.id}`} className="inline-block mt-4 text-blue-500 hover:underline">Ver detalles</Link>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No hay libros disponibles.</p>
            )}
        </div>
    );
}

export default Home;