import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import Swal from 'sweetalert2';

function Home() {
    const [libros, setLibros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const apiUrl = `${VITE_API_BASE_URL}/api/libros`;
    const navigate = useNavigate();

    const fetchLibros = () => {
        setLoading(true);
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const librosDisponibles = data.filter(libro => libro.disponible == true);
                setLibros(librosDisponibles);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchLibros();
    }, []);

    if (loading) {
        return <div className="text-center py-4">Cargando libros...</div>;
    }

    if (error) {
        return <div className="text-danger py-4">Error al cargar los libros: {error.message}</div>;
    }

    const handleAddToCart = (libroId, precio) => {
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
            Swal.fire({
                icon: 'success',
                title: '¡Reservado!',
                text: data.message,
                showConfirmButton: false,
                timer: 1500
            });
            fetchLibros();
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: '¡Oops!',
                text: `Error al añadir al carrito: ${error.message}`,
            });
        });
    };

    return (
        <div className="container py-5">
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {libros.map(libro => (
                    <div key={libro.id} className="col">
                        <div className="card h-100 shadow-sm">
                            <div className="book-cover-container">
                                {libro.imagen_portada && (
                                    <img
                                        src={`${VITE_API_BASE_URL}/${libro.imagen_portada}`}
                                        alt={`Portada de ${libro.titulo}`}
                                        className="book-cover-image"
                                    />
                                )}
                            </div>
                            <div className="card-body d-flex flex-column">
                                <hr className="my-2" />
                                <h4 className="card-title fw-bold text-black">{libro.titulo}</h4>
                                <p className="card-text text-secondary small">{libro.autor}</p>
                                <p className="card-text mt-auto">
                                    <strong className="text-danger">{libro.precio}€</strong>
                                </p>
                                <div className="mt-3 d-grid gap-2">
                                    {libro.esta_reservado && (
                                        <p className="mt-1 text-warning small">Reservado</p>
                                    )}
                                    <Link to={`/libro/${libro.id}`} className="btn btn-outline-primary btn-sm">Ver detalles</Link>
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => handleAddToCart(libro.id, libro.precio)}
                                        disabled={libro.esta_reservado}
                                    >
                                        {libro.esta_reservado ? 'Reservado' : 'Añadir'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {libros.length === 0 && <p className="mt-4 text-muted">No hay libros disponibles.</p>}
        </div>
    );
}

export default Home;