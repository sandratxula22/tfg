import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import moment from 'moment';

function Checkout() {
    const [carritoItems, setCarritoItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        direccion: '',
        ciudad: '',
        codigo_postal: '',
        pais: '',
    });
    const navigate = useNavigate();
    const authToken = localStorage.getItem('authToken');

    const countryOptions = [
        { name: 'España', code: 'ES' },
        { name: 'Alemania', code: 'DE' },
        { name: 'Francia', code: 'FR' },
        { name: 'Reino Unido', code: 'GB' },
        { name: 'Estados Unidos', code: 'US' },
    ];

    useEffect(() => {
        if (!authToken) {
            navigate('/login', { replace: true, state: { from: '/checkout' } });
        }
    }, [authToken, navigate]);

    const fetchCarrito = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!authToken) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/carrito`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar los ítems del carrito para el checkout');
            }
            const data = await response.json();
            const purchasableItems = data.detalles.filter(item => item.can_be_purchased);
            setCarritoItems(purchasableItems);

            if (purchasableItems.length !== data.detalles.length) {
                Swal.fire({
                    icon: 'warning',
                    title: '¡Atención!',
                    text: 'Algunos libros de tu carrito ya no están disponibles. Se han eliminado del resumen de compra.',
                    showConfirmButton: true,
                }).then(() => {
                    navigate('/carrito', { replace: true });
                });
            }

            if (purchasableItems.length === 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'Carrito vacío',
                    text: 'Tu carrito está vacío o los libros no están disponibles. Redirigiendo al carrito.',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/carrito', { replace: true });
                });
                return;
            }

        } catch (err) {
            setError(err.message);
            Swal.fire({
                icon: 'error',
                title: 'Error de carga',
                text: `No pudimos cargar tu carrito: ${err.message}. Por favor, inténtalo de nuevo.`,
            }).then(() => {
                navigate('/carrito', { replace: true });
            });

        } finally {
            setLoading(false);
        }
    }, [authToken, navigate]);

    useEffect(() => {
        if (authToken) {
            fetchCarrito();
        }
    }, [authToken, fetchCarrito]);

    const subtotal = carritoItems.reduce((sum, item) => sum + parseFloat(item.precio), 0);
    const shippingCost = 0;
    const totalFinal = subtotal + shippingCost;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!Object.values(formData).every(field => field.trim() !== '')) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, rellena todos los campos de dirección antes de proceder.',
            });
            setLoading(false);
            return;
        }

        if (carritoItems.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Carrito vacío',
                text: 'Tu carrito está vacío. No se puede proceder con el pago.',
            });
            setLoading(false);
            navigate('/carrito');
            return;
        }

        const currentAuthToken = localStorage.getItem('authToken');
        if (!currentAuthToken) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No estás autenticado.' });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/paypal/checkout/start`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentAuthToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al iniciar el pago con PayPal.');
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
        } catch (err) {
            setError(err.message);
            Swal.fire({
                icon: 'error',
                title: 'Error en el Pago',
                text: `Hubo un problema al iniciar el proceso de pago: ${err.message}`,
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando carrito para el pago...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger" role="alert">
                    Error: {error}. Por favor, vuelve a intentarlo desde el <Link to="/carrito">carrito</Link>.
                </div>
            </div>
        );
    }

    if (carritoItems.length === 0) {
        return (
            <div className="container py-5">
                <div className="alert alert-info" role="alert">
                    Tu carrito está vacío. <Link to="/libros">Explora nuestros libros únicos</Link>.
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h1 className="mb-4">Finalizar Compra</h1>

            <div className="row">
                <div className="col-md-7 order-md-1">
                    <h4 className="mb-3">Datos de Envío</h4>
                    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="nombre" className="form-label">Nombre</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    required
                                />
                                <div className="invalid-feedback">
                                    El nombre es obligatorio.
                                </div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="apellidos" className="form-label">Apellidos</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="apellidos"
                                    name="apellidos"
                                    value={formData.apellidos}
                                    onChange={handleInputChange}
                                    required
                                />
                                <div className="invalid-feedback">
                                    Los apellidos son obligatorios.
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="direccion" className="form-label">Dirección</label>
                            <input
                                type="text"
                                className="form-control"
                                id="direccion"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleInputChange}
                                placeholder="Calle, número, piso, puerta..."
                                required
                            />
                            <div className="invalid-feedback">
                                La dirección es obligatoria.
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-5 mb-3">
                                <label htmlFor="ciudad" className="form-label">Ciudad</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="ciudad"
                                    name="ciudad"
                                    value={formData.ciudad}
                                    onChange={handleInputChange}
                                    required
                                />
                                <div className="invalid-feedback">
                                    La ciudad es obligatoria.
                                </div>
                            </div>
                            <div className="col-md-4 mb-3">
                                <label htmlFor="codigo_postal" className="form-label">Código Postal</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="codigo_postal"
                                    name="codigo_postal"
                                    value={formData.codigo_postal}
                                    onChange={handleInputChange}
                                    required
                                />
                                <div className="invalid-feedback">
                                    El código postal es obligatorio.
                                </div>
                            </div>
                            <div className="col-md-3 mb-3">
                                <label htmlFor="pais" className="form-label">País</label>
                                <select
                                    className="form-select"
                                    id="pais"
                                    name="pais"
                                    value={formData.pais}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Selecciona...</option>
                                    {countryOptions.map((country) => (
                                        <option key={country.code} value={country.code}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="invalid-feedback">
                                    El país es obligatorio.
                                </div>
                            </div>
                        </div>
                        <hr className="mb-4" />
                        <button
                            className="btn btn-success btn-lg btn-block"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Procesando...' : `Pagar con PayPal (${totalFinal.toFixed(2)}€)`}
                        </button>
                    </form>
                </div>

                <div className="col-md-5 order-md-2 mb-4">
                    <h4 className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-muted">Tu Pedido</span>
                        <span className="badge bg-secondary rounded-pill">{carritoItems.length}</span>
                    </h4>
                    <ul className="list-group mb-3">
                        {carritoItems.map(item => (
                            <li key={item.id} className="list-group-item d-flex justify-content-between lh-condensed">
                                <div>
                                    <h6 className="my-0">{item.libro.titulo}</h6>
                                    <small className="text-muted">{item.libro.autor}</small>
                                </div>
                                <span className="text-muted">{parseFloat(item.precio).toFixed(2)}€</span>
                            </li>
                        ))}
                        <li className="list-group-item d-flex justify-content-between">
                            <span>Subtotal</span>
                            <strong>{subtotal.toFixed(2)}€</strong>
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                            <span>Envío</span>
                            <strong>{shippingCost.toFixed(2)}€</strong>
                        </li>
                        <li className="list-group-item d-flex justify-content-between bg-light">
                            <span className="text-success">Total</span>
                            <strong className="text-success">{totalFinal.toFixed(2)}€</strong>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Checkout;