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

    const authToken = localStorage.getItem('authToken');

    useEffect(() => {
        if (!authToken) {
            navigate('/login', { replace: true, state: { from: location.pathname } });
        }
    }, [authToken, navigate, location.pathname]);

    if (!authToken) {
        return null;
    }

    const fetchCarrito = useCallback(async () => {
        setLoading(true);
        setError(null);
        const currentAuthToken = localStorage.getItem('authToken');
        if (!currentAuthToken) {
            setLoading(false);
            setError('Usuario no autenticado. Por favor, inicia sesión.');
            return;
        }

        try {
            const response = await fetch(`${VITE_API_BASE_URL}/api/carrito`, {
                headers: {
                    'Authorization': `Bearer ${currentAuthToken}`,
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
        if (authToken) {
            fetchCarrito();
        }

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
                navigate('/pedidos', { replace: true });
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
    }, [fetchCarrito, location.search, navigate, authToken]);

    const handleDeleteItem = async (itemId) => {
        const currentAuthToken = localStorage.getItem('authToken');
        if (!currentAuthToken) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No estás autenticado para realizar esta acción.' });
            return;
        }
        try {
            const response = await fetch(`${VITE_API_BASE_URL}/api/carrito/remove/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${currentAuthToken}`,
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
                text: `Error al eliminar el item: ${error.message}`,
            });
        }
    };

    const handleRenewReservation = async (itemId) => {
        const currentAuthToken = localStorage.getItem('authToken');
        if (!currentAuthToken) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No estás autenticado para realizar esta acción.' });
            return;
        }
        try {
            const response = await fetch(`${VITE_API_BASE_URL}/api/carrito/renew/${itemId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentAuthToken}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 409 && (errorData.message.includes('reservado por otra persona') || errorData.message.includes('no está disponible para la compra'))) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Lo sentimos',
                        text: errorData.message,
                    });
                    fetchCarrito();
                    return;
                } else if (response.status === 404 && errorData.message.includes('Item de carrito no encontrado')) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'El libro ya no se encuentra en tu carrito. Recargando...',
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
                text: `Error al renovar la reserva: ${error.message}`,
            });
        }
    };

    const getReservationStatus = (item) => {
        if (item.status_message) {
            const isExpiredForCurrentUser = item.reservation_expired_for_current_user;
            const canBePurchased = item.can_be_purchased;
            const isAvailableOverall = item.libro?.disponible;

            if (!canBePurchased) {
                return <span className="text-danger">{item.status_message}</span>;
            } else if (isExpiredForCurrentUser) {
                return (
                    <div>
                        <span className="text-danger">{item.status_message}</span>
                        <button
                            className="btn btn-sm btn-outline-secondary ms-2"
                            onClick={() => handleRenewReservation(item.id)}
                            disabled={!isAvailableOverall}
                        >
                            Renovar
                        </button>
                    </div>
                );
            } else if (item.reservado_hasta) {
                const reservationEndTimeUTC = moment.utc(item.reservado_hasta);
                const nowUTC = moment.utc();
                const timeLeft = moment.duration(reservationEndTimeUTC.diff(nowUTC));
                const minutes = Math.ceil(timeLeft.asMinutes());
                return `Reservado por ${minutes} minutos`;
            }
        }
        return null;
    };

    const handleCheckout = async () => {
        const currentAuthToken = localStorage.getItem('authToken');
        if (!currentAuthToken) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No estás autenticado para realizar esta acción.' });
            return;
        }

        const itemsNotPurchasable = carritoItems.filter(item => !item.can_be_purchased);
        if (itemsNotPurchasable.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Libros no comprables',
                text: 'Algunos libros de tu carrito ya no están disponibles o han sido reservados por otra persona. Por favor, revisa tu carrito.',
            }).then(() => {
                fetchCarrito();
            });
            return;
        }

        navigate('/checkout');
    };

    const isCheckoutDisabled = carritoItems.length === 0 ||
        carritoItems.some(item => !item.can_be_purchased);

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
                        <li key={item.id} className={`list-group-item d-flex justify-content-between align-items-center ${!item.can_be_purchased ? 'list-group-item-danger' : ''}`}>
                            <div>
                                <h6 className="my-0">{item.libro.titulo}</h6>
                                <small className="text-muted">{item.libro.autor}</small>
                                <div className="mt-1 small">
                                    {getReservationStatus(item)}
                                </div>
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
                <div className="mt-4 text-end">
                    <strong>Total: {carritoItems.reduce((total, item) => total + (item.can_be_purchased ? parseFloat(item.precio) : 0), 0).toFixed(2)}€</strong>
                </div>
            )}
            {carritoItems.length > 0 && (
                <div className="mt-3 text-end">
                    <button
                        className="btn btn-success"
                        onClick={handleCheckout}
                        disabled={isCheckoutDisabled}
                    >
                        Proceder al pago
                    </button>
                </div>
            )}
        </div>
    );
}

export default Carrito;