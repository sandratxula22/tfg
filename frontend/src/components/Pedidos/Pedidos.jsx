import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import moment from 'moment';
import { Alert, Card, Spinner, ListGroup } from 'react-bootstrap'; // Importa Card y ListGroup

function Pedidos() {
    const [pedidos, setPedidos] = useState([]);
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

    const fetchPedidos = useCallback(async () => {
        setLoading(true);
        setError(null);
        const currentAuthToken = localStorage.getItem('authToken');
        if (!currentAuthToken) {
            setLoading(false);
            setError('Usuario no autenticado. Por favor, inicia sesión.');
            return;
        }

        try {
            const response = await fetch(`${VITE_API_BASE_URL}/api/pedidos`, {
                headers: {
                    'Authorization': `Bearer ${currentAuthToken}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar tus pedidos');
            }
            const data = await response.json();
            const pedidosPagados = data.filter(pedido => pedido.estado === 'pagado');
            setPedidos(pedidosPagados);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [VITE_API_BASE_URL]);

    useEffect(() => {
        if (authToken) {
            fetchPedidos();
        }

        const queryParams = new URLSearchParams(location.search);
        const paymentStatus = queryParams.get('payment');
        const lastPedidoId = queryParams.get('pedido_id');
        const errorMessage = queryParams.get('message');

        const cleanUrl = location.pathname;
        if (paymentStatus || lastPedidoId || errorMessage) {
            navigate(cleanUrl, { replace: true });
        }

        if (paymentStatus === 'success') {
            Swal.fire({
                icon: 'success',
                title: '¡Pago Exitoso!',
                text: `Tu compra ha sido procesada correctamente.`,
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
    }, [fetchPedidos, location.search, navigate, authToken]);

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando pedidos...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <Alert variant="danger" role="alert">
                    Error al cargar los pedidos: {error}
                </Alert>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h1 className="mb-4">Mis Pedidos</h1>
            {pedidos.length === 0 ? (
                <Alert variant="info" role="alert">
                    Aún no tienes pedidos realizados. ¡Anímate a explorar nuestros libros!
                </Alert>
            ) : (
                <div className="d-grid gap-4">
                    {pedidos.map(pedido => (
                        <Card key={pedido.id} className="shadow-sm">
                            <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                                <h5>Pedido #{pedido.id}</h5>
                                <span className={`badge ${pedido.estado === 'pagado' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                    {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                                </span>
                            </Card.Header>
                            <Card.Body>
                                <p className="text-muted mb-1">{moment(pedido.created_at).format('DD/MM/YYYY HH:mm')}</p>

                                {pedido.nombre_envio && (
                                    <div className="mt-3 mb-3 p-2 bg-light rounded">
                                        <strong>Envío a:</strong>
                                        <p className="mb-0">
                                            {pedido.nombre_envio} {pedido.apellidos_envio}
                                        </p>
                                        <p className="mb-0">
                                            {pedido.direccion_envio}
                                        </p>
                                        <p className="mb-0">
                                            {pedido.codigo_postal_envio} {pedido.ciudad_envio}, {pedido.pais_envio}
                                        </p>
                                    </div>
                                )}

                                {pedido.detalles && pedido.detalles.length > 0 && (
                                    <div className="mt-3 mb-3 p-2">
                                        <h6><strong>Items:</strong></h6>
                                        <ListGroup variant="flush">
                                            {pedido.detalles.map(detalle => (
                                                <ListGroup.Item key={detalle.id} className="d-flex justify-content-between align-items-center py-1">
                                                    <span>{detalle.libro.titulo} - {detalle.libro.autor}</span>
                                                    <span>{parseFloat(detalle.precio).toFixed(2)}€</span>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                        <div className="d-flex justify-content-end mt-3">
                                            <p className="fs-5 fw-bold text-primary mb-0">
                                                {parseFloat(pedido.total).toFixed(2)}€
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Pedidos;