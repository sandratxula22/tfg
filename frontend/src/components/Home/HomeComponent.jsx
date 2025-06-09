import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import FloatingBotButton from '../Bot/FloatingBotButton';
import { Container, Row, Col, Spinner, Alert, Button, Form } from 'react-bootstrap';
import './Home.css';

function Home() {
    const [libros, setLibros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        nombre: '',
        autor: '',
        genero: '',
        precio_min: '',
        precio_max: ''
    });
    const [generos, setGeneros] = useState([]);
    const [priceRangeError, setPriceRangeError] = useState('');

    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();

    const fetchAllGeneros = useCallback(async () => {
        try {
            const response = await fetch(`/api/libros/generos`);
            if (!response.ok) {
                throw new Error('Error al cargar la lista completa de géneros.');
            }
            const data = await response.json();
            setGeneros(data);
        } catch (err) {
            console.error("Error fetching all genres:", err);
        }
    }, []);


    const fetchLibros = useCallback((currentFilters) => {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        if (currentFilters.nombre) queryParams.append('nombre', currentFilters.nombre);
        if (currentFilters.autor) queryParams.append('autor', currentFilters.autor);
        if (currentFilters.genero) queryParams.append('genero', currentFilters.genero);
        if (currentFilters.precio_min) queryParams.append('precio_min', currentFilters.precio_min);
        if (currentFilters.precio_max) queryParams.append('precio_max', currentFilters.precio_max);

        const apiUrlWithFilters = `/api/libros?${queryParams.toString()}`;

        fetch(apiUrlWithFilters)
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
    }, []);

    useEffect(() => {
        fetchAllGeneros();
        fetchLibros(filters);
    }, [fetchAllGeneros, fetchLibros]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => {
            const newFilters = { ...prevFilters, [name]: value };

            const minPrice = parseFloat(newFilters.precio_min);
            const maxPrice = parseFloat(newFilters.precio_max);

            if (!isNaN(minPrice) && !isNaN(maxPrice) && minPrice > maxPrice) {
                setPriceRangeError('El precio mínimo no puede ser mayor que el precio máximo.');
            } else {
                setPriceRangeError('');
            }
            return newFilters;
        });
    };

    const handleApplyFilters = (e) => {
        e.preventDefault();

        const minPrice = parseFloat(filters.precio_min);
        const maxPrice = parseFloat(filters.precio_max);

        if (!isNaN(minPrice) && !isNaN(maxPrice) && minPrice > maxPrice) {
            Swal.fire({
                icon: 'error',
                title: 'Error de Filtro',
                text: 'El precio mínimo no puede ser mayor que el precio máximo. Por favor, corrige los valores.',
            });
            return;
        }

        setPriceRangeError('');

        fetchLibros(filters);
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            nombre: '',
            autor: '',
            genero: '',
            precio_min: '',
            precio_max: ''
        };
        setFilters(clearedFilters);
        setPriceRangeError(''); 
        fetchLibros(clearedFilters);
    };

    const handleAddToCart = useCallback((libroId, precio) => {
        const carritoApiUrl = `/api/carrito/add`;
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
                    text: data.message,
                    showConfirmButton: false,
                    timer: 1500
                });
                fetchLibros(filters);
            }
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: '¡Oops!',
                text: `Error al añadir al carrito: ${error.message}`,
            });
        });
    },[]);

    return (
        <Container className="py-5">
            <Row>
                <Col md={3} className="mb-4 mb-md-0 border-end pe-md-4">
                    <h3 className="mb-3">Filtros</h3>
                    <Form onSubmit={handleApplyFilters}>
                        <Form.Group className="mb-3">
                            <Form.Label>Título</Form.Label>
                            <Form.Control
                                type="text"
                                name="nombre"
                                value={filters.nombre}
                                onChange={handleFilterChange}
                                placeholder="Buscar por título"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Autor</Form.Label>
                            <Form.Control
                                type="text"
                                name="autor"
                                value={filters.autor}
                                onChange={handleFilterChange}
                                placeholder="Buscar por autor"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Género</Form.Label>
                            <Form.Select
                                name="genero"
                                value={filters.genero}
                                onChange={handleFilterChange}
                            >
                                <option value="">Todos los géneros</option>
                                {generos.map(gen => (
                                    <option key={gen} value={gen}>{gen}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Precio Mínimo</Form.Label>
                            <Form.Control
                                type="number"
                                name="precio_min"
                                value={filters.precio_min}
                                onChange={handleFilterChange}
                                min="0"
                                isInvalid={!!priceRangeError} 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Precio Máximo</Form.Label>
                            <Form.Control
                                type="number"
                                name="precio_max"
                                value={filters.precio_max}
                                onChange={handleFilterChange}
                                min="0"
                                isInvalid={!!priceRangeError} 
                            />
                            <Form.Control.Feedback type="invalid">
                                {priceRangeError}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <div className="d-grid gap-2">
                            <Button variant="primary" type="submit" disabled={!!priceRangeError}>
                                Aplicar Filtros
                            </Button>
                            <Button variant="outline-secondary" onClick={handleClearFilters}>Limpiar Filtros</Button>
                        </div>
                    </Form>
                </Col>

                <Col md={9}>
                    {loading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Cargando libros...</span>
                            </Spinner>
                        </div>
                    ) : error ? (
                        <div className="text-center py-4">
                            <Alert variant="danger">Error al cargar los libros: {error.message}</Alert>
                        </div>
                    ) : (
                        <Row xs={1} sm={2} md={2} lg={3} className="g-4 justify-content-center">
                            {libros.length === 0 ? (
                                <Col className="text-center">
                                    <Alert variant="info" className="mt-4">
                                        No hay libros disponibles con los filtros aplicados.
                                    </Alert>
                                </Col>
                            ) : (
                                libros.map(libro => (
                                    <Col key={libro.id}>
                                        <div className="card h-100 shadow-sm book-card">
                                            <div className="book-cover-container">
                                                {libro.imagen_portada && (
                                                    <img
                                                        src={`/${libro.imagen_portada}`}
                                                        alt={`Portada de ${libro.titulo}`}
                                                        className="book-cover-image"
                                                    />
                                                )}
                                            </div>
                                            <div className="card-body d-flex flex-column">
                                                <hr className="my-2" />
                                                <h4 className="card-title fw-bold">{libro.titulo}</h4>
                                                <p className="card-text text-muted small">{libro.autor}</p>
                                                
                                                <div className="d-flex align-items-center justify-content-between mt-auto mb-3">
                                                    <p className="h5 text-danger fw-bold mb-0">{parseFloat(libro.precio).toFixed(2)}€</p>
                                                    {libro.esta_reservado ? (
                                                        <span className="badge bg-warning text-dark">Reservado</span>
                                                    ) : (
                                                        <span className="badge bg-success">Disponible</span>
                                                    )}
                                                </div>

                                                <div className="d-grid gap-2">
                                                    <Link to={`/libro/${libro.id}`} className="btn btn-outline-primary btn-sm">Ver detalles</Link>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleAddToCart(libro.id, libro.precio)}
                                                        disabled={libro.esta_reservado}
                                                    >
                                                        {libro.esta_reservado ? 'Reservado' : 'Añadir'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                ))
                            )}
                        </Row>
                    )}
                </Col>
            </Row>

            <FloatingBotButton />
        </Container>
    );
}

export default Home;