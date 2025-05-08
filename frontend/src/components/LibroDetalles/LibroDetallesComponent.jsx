import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function LibroDetallesComponent() {
    const { id } = useParams();
    const [libro, setLibro] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLibro = async () => {
            setLoading(true);
            setError(null);
            try {
                const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
                const apiUrl = `${VITE_API_BASE_URL}/api/libros/${id}`;
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setLibro(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLibro();
    }, [id]);

    if (loading) {
        return <div className="text-center py-4">Cargando detalles del libro...</div>;
    }

    if (error) {
        return <div className="text-red-500 py-4">Error al cargar los detalles: {error.message}</div>;
    }

    if (!libro) {
        return <div className="text-gray-500 py-4">Libro no encontrado.</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">{libro.titulo}</h1>

            <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="md:w-1/4">
                    {libro.imagen_portada && (
                        <img
                            src={`${import.meta.env.VITE_API_BASE_URL}/portadas/${libro.imagen_portada}`}
                            alt={`Portada de ${libro.titulo}`}
                            className="w-full h-auto rounded-lg shadow-md"
                        />
                    )}
                </div>

                <div className="md:w-1/2">
                    <p className="text-gray-700 mb-2">Autor: {libro.autor}</p>
                    <p className="text-gray-700 mb-2">Género: {libro.genero}</p>
                    <p className="text-gray-700 mb-4">Precio: {libro.precio}€</p>
                    <p className="text-gray-800">{libro.descripcion}</p>
                </div>
            </div>
            
            {libro.imagenes_adicionales && libro.imagenes_adicionales.length > 0 && (
            <div className="flex flex-wrap m-auto gap-4 mb-8">
                {libro.imagenes_adicionales.map(imagen => (
                    <img
                        key={imagen.id}
                        src={`${import.meta.env.VITE_API_BASE_URL}/adicionales/${imagen.url}`}
                        alt={`Imagen adicional de ${libro.titulo}`}
                        className="w-auto h-48 rounded-lg shadow-md"
                    />
                ))}
            </div>
        )}

            <Link to="/" className="inline-block mt-4 text-blue-500 hover:underline">Volver a la lista</Link>
        </div>
    );
}

export default LibroDetallesComponent;