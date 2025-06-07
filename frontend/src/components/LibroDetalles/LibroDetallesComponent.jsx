import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Container, Row, Col, Button, Carousel, Spinner, Alert } from 'react-bootstrap';
import './LibroDetalles.css';

function LibroDetallesComponent() {
    const { id } = useParams();
    const [libro, setLibro] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();

    const fetchLibro = async () => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = `${VITE_API_BASE_URL}/api/libros/${id}`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Libro no encontrado.');
                }
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const data = await response.json();
            setLibro(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLibro();
    }, [id, VITE_API_BASE_URL]);

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
                if (data.already_in_cart) {
                    Swal.fire({
                        icon: 'info',
                        title: '¡Ya está en el carrito!',
                        text: 'Este libro ya se encuentra en tu carrito y está reservado.',
                        showConfirmButton: false,
                        timer: 1500
                    });
                } else if (data.message.includes('reservado por otra persona')) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Lo sentimos',
                        text: data.message,
                        showConfirmButton: false,
                        timer: 2000
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
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando detalles del libro...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">Error al cargar los detalles: {error.message}</Alert>
                <Link to="/" className="btn btn-primary mt-3">Volver a la lista de libros</Link>
            </Container>
        );
    }

    if (!libro) {
        return (
            <Container className="py-5 text-center">
                <Alert variant="info">Libro no encontrado.</Alert>
                <Link to="/" className="btn btn-primary mt-3">Volver a la lista de libros</Link>
            </Container>
        );
    }

    const allImages = [
        libro.imagen_portada,
        ...(libro.imagenes_adicionales || []).map(img => img.url)
    ].filter(Boolean);

    return (
        <Container className="py-5">
            <Row>
                <Col md={6}>
                    {allImages.length > 1 ? (
                        <Carousel data-bs-theme="dark" className="book-carousel">
                            {allImages.map((image, index) => (
                                <Carousel.Item key={index}>
                                    <img
                                        className="d-block w-100 book-detail-image"
                                        src={`${VITE_API_BASE_URL}/${image}`}
                                        alt={`Imagen ${index + 1} de ${libro.titulo}`}
                                    />
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    ) : (
                        <img
                            className="d-block w-100 book-detail-image"
                            src={`${VITE_API_BASE_URL}/${allImages[0]}`}
                            alt={`Portada de ${libro.titulo}`}
                        />
                    )}
                </Col>

                <Col md={6} className="ps-md-4">
                    <h1 className="mb-2">{libro.titulo}</h1>
                    <p className="text-muted lead">{libro.autor}</p>
                    <hr />
                    <p className="mb-4">{libro.descripcion}</p>

                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <p className="h3 text-danger fw-bold">{libro.precio}€</p>
                        <div>
                            {libro.disponible ? (
                                libro.esta_reservado ? (
                                    <span className="badge bg-warning text-dark me-2">Reservado</span>
                                ) : (
                                    <span className="badge bg-success me-2">Disponible</span>
                                )
                            ) : (
                                <span className="badge bg-danger me-2">No Disponible</span>
                            )}

                            <Button
                                variant="primary"
                                onClick={() => handleAddToCart(libro.id, libro.precio)}
                                disabled={!libro.disponible || libro.esta_reservado}
                            >
                                {libro.esta_reservado ? 'Reservado' : 'Añadir al carrito'}
                            </Button>
                        </div>
                    </div>

                    <Link to="/" className="btn btn-outline-secondary mt-3">Volver a la lista</Link>
                </Col>
            </Row>
        </Container>
    );
}

export default LibroDetallesComponent;