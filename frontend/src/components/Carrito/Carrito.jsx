import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import moment from 'moment';

function Carrito() {
    const [carritoItems, setCarritoItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const location = useLocation();
    const navigate = useNavigate();

    const fetchCarrito = useCallback(async () => {
        setLoading(true);
        setError(null);
        const authToken = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${VITE_API_BASE_URL}/api/carrito`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar el carrito');
            }
            const data = await response.json();
            setCarritoItems(data.detalles);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [VITE_API_BASE_URL]);

    useEffect(() => {
        fetchCarrito();

        const queryParams = new URLSearchParams(location.search);
        const paymentStatus = queryParams.get('payment');
        const pedidoId = queryParams.get('pedido_id');
        const errorMessage = queryParams.get('message');


        if (paymentStatus === 'success') {
            Swal.fire({
                icon: 'success',
                title: '¡Pago Exitoso!',
                text: 'Tu pedido ha sido procesado correctamente.',
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                navigate('/pedidos/' + pedidoId, { replace: true });
            });
        } else if (paymentStatus === 'cancelled') {
            Swal.fire({
                icon: 'info',
                title: 'Pago Cancelado',
                text: 'Has cancelado el proceso de pago.',
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                navigate('/carrito', { replace: true });
            });
        } else if (paymentStatus === 'error') {
            Swal.fire({
                icon: 'error',
                title: 'Error en el Pago',
                text: errorMessage || 'Hubo un error al procesar tu pago.',
                showConfirmButton: false,
                timer: 3000
            }).then(() => {
                navigate('/carrito', { replace: true });
            });
        }
    }, [fetchCarrito, location.search, navigate]);

    const handleDeleteItem = async (itemId) => {
        const authToken = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${VITE_API_BASE_URL}/api/carrito/remove/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar el item del carrito');
            }
            setCarritoItems(carritoItems.filter(item => item.id !== itemId));
            Swal.fire({
                icon: 'success',
                title: '¡Eliminado!',
                text: 'El libro ha sido eliminado de tu carrito.',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: '¡Error!',
                text: `Error al eliminar el item: ${error}`,
            });
        }
    };

    const handleRenewReservation = async (itemId) => {
        const authToken = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${VITE_API_BASE_URL}/api/carrito/renew/${itemId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 409 && errorData.message.includes('reservado por otra persona')) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Lo sentimos',
                        text: errorData.message,
                    });
                    fetchCarrito();
                    return;
                }
                throw new Error(errorData.message || 'Error al renovar la reserva');
            }
            const data = await response.json();
            setCarritoItems(prevItems => prevItems.map(item =>
                item.id === itemId ? { ...item, reservado_hasta: data.reservado_hasta } : item
            ));
            Swal.fire({
                icon: 'success',
                title: '¡Reserva renovada!',
                text: 'Tu reserva ha sido renovada por 15 minutos más.',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: '¡Error!',
                text: `Error al renovar la reserva: ${error}`,
            });
        }
    };

    const getReservationStatus = (reservedUntil, itemId) => {
        if (reservedUntil) {
            const reservationEndTimeUTC = moment.utc(reservedUntil);
            const nowUTC = moment.utc();
            const timeLeft = moment.duration(reservationEndTimeUTC.diff(nowUTC));

            if (timeLeft.asMinutes() > 0) {
                const minutes = Math.ceil(timeLeft.asMinutes());
                return `Reservado por ${minutes} minutos`;
            } else {
                return (
                    <div>
                        <span className="text-danger">Reserva expirada</span>
                        <button
                            className="btn btn-sm btn-outline-secondary ms-2"
                            onClick={() => handleRenewReservation(itemId)}
                        >
                            Renovar
                        </button>
                    </div>
                );
            }
        }
        return null;
    };

    const handleCheckout = async () => {
        const authToken = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${VITE_API_BASE_URL}/api/paypal/checkout/start`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                Swal.fire({
                    icon: 'error',
                    title: 'Error al iniciar el pago con PayPal',
                    text: errorData.message || 'Hubo un problema al iniciar el proceso de pago con PayPal.',
                });
                fetchCarrito();
                return;
            }

            const data = await response.json();
            if (data.approval_url) {
                window.location.href = data.approval_url;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se recibió la URL de aprobación de PayPal.',
                });
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: '¡Error!',
                text: `Error de conexión: ${error.message}`,
            });
        }
    };

    return (
        <div className="container py-5">
            <h1 className="mb-4">Tu Carrito</h1>
            <ul className="list-group">
                {loading ? (
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                ) : carritoItems.length === 0 ? (
                    <div className="alert alert-info" role="alert">
                        Tu carrito está vacío. <Link to="/libros">Explora nuestros libros únicos</Link>.
                    </div>
                ) : (
                    carritoItems.map(item => (
                        <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="my-0">{item.libro.titulo}</h6>
                                <small className="text-muted">{item.libro.autor}</small>
                                {item.reservado_hasta && (
                                    <div className="mt-1 small">{getReservationStatus(item.reservado_hasta, item.id)}</div>
                                )}
                            </div>
                            <div>
                                <span className="badge bg-primary rounded-pill">{item.precio}€</span>
                                <button
                                    className="btn btn-outline-danger btn-sm ms-2"
                                    onClick={() => handleDeleteItem(item.id)}
                                >
                                    Borrar
                                </button>
                            </div>
                        </li>
                    ))
                )}
            </ul>
            {carritoItems.length > 0 && (
                <div className="mt-4">
                    <strong>Total: {carritoItems.reduce((total, item) => total + parseFloat(item.precio), 0).toFixed(2)}€</strong>
                </div>
            )}
            {carritoItems.length > 0 && (
                <div className="mt-3">
                    <button className="btn btn-success me-2" onClick={handleCheckout}>
                        Pagar con PayPal
                    </button>
                </div>
            )}
        </div>
    );
}

export default Carrito;