import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import moment from 'moment'; // Importa moment.js para trabajar con fechas

function Carrito() {
    const [carritoItems, setCarritoItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchCarrito = async () => {
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
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCarrito();
    }, []);

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

    const getReservationStatus = (reservedUntil) => {
        if (reservedUntil) {
            const reservationEndTimeUTC = moment.utc(reservedUntil);
            const nowUTC = moment.utc();
            const timeLeft = moment.duration(reservationEndTimeUTC.diff(nowUTC));

            if (timeLeft.asMinutes() > 0) {
                const minutes = Math.ceil(timeLeft.asMinutes());
                return `Reservado por ${minutes} minutos`;
            } else {
                return <span className="text-danger">Reserva expirada</span>;
            }
        }
    };

    return (
        <div className="container py-5">
            <h1 className="mb-4">Tu Carrito</h1>
            <ul className="list-group">
                {carritoItems.map(item => (
                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="my-0">{item.libro.titulo}</h6>
                            <small className="text-muted">{item.libro.autor}</small>
                            {item.reservado_hasta && (
                                <div className="mt-1 small">{getReservationStatus(item.reservado_hasta)}</div>
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
                ))}
            </ul>
            <div className="mt-4">
                <strong>Total: {carritoItems.reduce((total, item) => total + parseFloat(item.precio), 0).toFixed(2)}€</strong>
            </div>
            <div className="mt-3">
                <Link to="/checkout" className="btn btn-success">Ir a la compra</Link>
            </div>
        </div>
    );
}

export default Carrito;