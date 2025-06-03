import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import moment from 'moment';

function Pedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const location = useLocation();
    const navigate = useNavigate();

    const fetchPedidos = useCallback(async () => {
        setLoading(true);
        setError(null);
        const authToken = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${VITE_API_BASE_URL}/api/pedidos`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar tus pedidos');
            }
            const data = await response.json();
            const pedidosPagados = data.filter(pedido => pedido.estado == 'pagado');
            setPedidos(pedidosPagados);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [VITE_API_BASE_URL]);

    useEffect(() => {
        fetchPedidos();

        const queryParams = new URLSearchParams(location.search);
        const paymentStatus = queryParams.get('payment');
        const lastPedidoId = queryParams.get('pedido_id');
        const errorMessage = queryParams.get('message');

        if (paymentStatus === 'success') {
            Swal.fire({
                icon: 'success',
                title: '¡Pago Exitoso!',
                text: `Tu compra ha sido procesada correctamente. ID de pedido: ${lastPedidoId || 'N/A'}`,
                showConfirmButton: false,
                timer: 3000
            }).then(() => {
                navigate('/pedidos', { replace: true });
            });
        } else if (paymentStatus === 'error') {
            Swal.fire({
                icon: 'error',
                title: 'Error en el Pago',
                text: errorMessage || 'Hubo un error al procesar tu pago. Por favor, inténtalo de nuevo.',
                showConfirmButton: false,
                timer: 3000
            }).then(() => {
                navigate('/pedidos', { replace: true });
            });
        }
    }, [fetchPedidos, location.search, navigate]);

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando pedidos...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger" role="alert">
                    Error al cargar los pedidos: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h1 className="mb-4">Mis Pedidos</h1>
            {pedidos.length === 0 ? (
                <div className="alert alert-info" role="alert">
                    Aún no tienes pedidos realizados. ¡Anímate a explorar nuestros libros!
                </div>
            ) : (
                <ul className="list-group">
                    {pedidos.map(pedido => (
                        <li key={pedido.id} className="list-group-item mb-3 shadow-sm">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5>Pedido #{pedido.id}</h5>
                                <span className={`badge ${pedido.estado === 'pagado' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                    {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                                </span>
                            </div>
                            <p className="text-muted mb-1">Fecha: {moment(pedido.fecha_pedido).format('DD/MM/YYYY HH:mm')}</p>
                            <p className="mb-2">Total: <strong>{parseFloat(pedido.total).toFixed(2)}€</strong></p>

                            {pedido.detalles && pedido.detalles.length > 0 && (
                                <div className="mt-2">
                                    <h6>Items:</h6>
                                    <ul className="list-group list-group-flush">
                                        {pedido.detalles.map(detalle => (
                                            <li key={detalle.id} className="list-group-item d-flex justify-content-between align-items-center py-1">
                                                <span>{detalle.libro.titulo}</span>
                                                <span>{parseFloat(detalle.precio).toFixed(2)}€</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Pedidos;