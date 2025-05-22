import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './LibroDetalles.css'; // Asegúrate de tener esta importación

function LibroDetallesComponent() {
    const { id } = useParams();
    const [libro, setLibro] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLibro = async () => {
            setLoading(true);
            setError(null);
            try {
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

    const handleAddToCart = (libroId, precio) => {
        // ... (la misma función handleAddToCart que antes) ...
        const carritoApiUrl = `${VITE_API_BASE_URL}/api/carrito/add`;
        const authToken = localStorage.getItem('authToken');

        if (!authToken) {
            Swal.fire({
                icon: 'warning',
                title: '¡Debes iniciar sesión!',
                text: 'Para añadir libros al carrito, primero debes iniciar sesión.',
                showCancelButton: true,
                confirmButtonText: 'Iniciar Sesión',
                cancelButtonText: 'Cancelar',
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login');
                }
            });
            return;
        }

        fetch(carritoApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                id_libro: libroId,
                precio: precio,
            }),
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        const error = new Error(data.message || 'Error al añadir al carrito');
                        error.statusCode = response.status;
                        throw error;
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.already_in_cart) {
                    Swal.fire({
                        icon: 'info',
                        title: '¡Ya está en el carrito!',
                        text: 'Este libro ya se encuentra en tu carrito y está reservado.',
                        showConfirmButton: false,
                        timer: 1500
                    });
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Reservado!',
                        text: 'El libro ha sido reservado por 15 minutos.',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    fetchLibro();
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: '¡Oops!',
                    text: `Error al añadir al carrito: ${error.message}`,
                });
            });
    };

    if (loading) {
        return <div className="text-center py-4">Cargando detalles del libro...</div>;
    }

    if (error) {
        return <div className="text-red-500 py-4">Error al cargar los detalles: {error.message}</div>;
    }

    if (!libro) {
        return <div className="text-gray-500 py-4">Libro no encontrado.</div>;
    }

    const allImages = [
        libro.imagen_portada,
        ...(libro.imagenes_adicionales || []).map(img => img.url)
    ].filter(Boolean);

    const goToPrevious = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length);
    };

    const goToNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
    };

    return (
        <div className="container mx-auto py-8">
            {allImages.length > 0 && (
                <div className="relative mb-8">
                    <img
                        src={`${VITE_API_BASE_URL}/${allImages[currentImageIndex]}`}
                        alt={`${libro.titulo} - Imagen ${currentImageIndex + 1}`}
                        className="w-full rounded-lg shadow-md carousel-image"
                    />
                    {allImages.length > 1 && (
                        <>
                            <button
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-300 bg-opacity-50 text-gray-800 p-2 rounded-full hover:bg-gray-400"
                                onClick={goToPrevious}
                            >
                                &lt;
                            </button>
                            <button
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-300 bg-opacity-50 text-gray-800 p-2 rounded-full hover:bg-gray-400"
                                onClick={goToNext}
                            >
                                &gt;
                            </button>
                        </>
                    )}
                </div>
            )}

            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{libro.titulo}</h1>
                <p className="text-gray-700 mb-1">Autor: {libro.autor}</p>
                <p className="text-gray-800">{libro.descripcion}</p>
            </div>

            {/*
            <div className="flex items-center justify-between mb-4">
                <p className="text-xl font-semibold">{libro.precio}€</p>
                <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => handleAddToCart(libro.id, libro.precio)}
                >
                    Añadir al carrito
                </button>
            </div>
            */}

            <Link to="/" className="inline-block mt-4 text-blue-500 hover:underline">Volver a la lista</Link>
        </div>
    );
}

export default LibroDetallesComponent;