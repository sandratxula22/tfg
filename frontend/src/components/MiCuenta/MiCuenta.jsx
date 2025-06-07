import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';
import { Row, Col } from 'react-bootstrap';
import './MiCuenta.css';

function MiCuenta() {
    const [userData, setUserData] = useState({
        nombre: '',
        apellido: '',
        direccion: '',
        correo: ''
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { logout, checkAuthStatus } = useAuth();
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const authToken = localStorage.getItem('authToken');

    useEffect(() => {
        if (!authToken) {
            navigate('/login', { replace: true, state: { from: '/mi-cuenta' } });
        }
    }, [authToken, navigate]);

    if (!authToken) {
        return null;
    }

    const fetchUserData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${VITE_API_BASE_URL}/api/usuario`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                    const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar los datos del usuario.');
            }
            const data = await response.json();
            setUserData({
                nombre: data.nombre,
                apellido: data.apellido,
                direccion: data.direccion,
                correo: data.correo
            });
        } catch (err) {
            setError(err.message);
            Swal.fire({
                icon: 'error',
                title: 'Error de carga',
                text: err.message,
            });
            if (err.message.includes('autenticado') || err.message.includes('inválido')) {
                logout();
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [VITE_API_BASE_URL, authToken, logout, navigate]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const handleBasicInfoChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevData => ({ ...prevData, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmitBasicInfo = async (e) => {
        e.preventDefault();
        Swal.fire({
            title: '¿Confirmar cambios?',
            text: '¿Estás seguro de que quieres actualizar tu información?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, actualizar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`${VITE_API_BASE_URL}/api/usuario`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(userData)
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Error al actualizar la información.');
                    }

                    await checkAuthStatus();
                    Swal.fire('¡Actualizado!', 'Tu información ha sido actualizada.', 'success');
                } catch (err) {
                    Swal.fire('Error', err.message, 'error');
                }
            }
        });
    };

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        Swal.fire({
            title: '¿Confirmar cambio de contraseña?',
            text: '¿Estás seguro de que quieres cambiar tu contraseña?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                if (passwordData.new_password !== passwordData.new_password_confirmation) {
                    Swal.fire('Error', 'Las nuevas contraseñas no coinciden.', 'error');
                    return;
                }
                if (passwordData.new_password.length < 8) {
                    Swal.fire('Error', 'La nueva contraseña debe tener al menos 8 caracteres.', 'error');
                    return;
                }

                try {
                    const response = await fetch(`${VITE_API_BASE_URL}/api/usuario/password`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(passwordData)
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Error al cambiar la contraseña.');
                    }

                    setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
                    Swal.fire('¡Actualizada!', 'Tu contraseña ha sido cambiada.', 'success');
                } catch (err) {
                    Swal.fire('Error', err.message, 'error');
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="container-fluid py-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando datos...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid py-5">
                <div className="alert alert-danger" role="alert">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-5">
            <h1 className="mb-4 text-center">Mi Cuenta</h1>
            <Row className="justify-content-center">
                <Col md={5} className="mb-4 mb-md-0 d-flex flex-column">
                    <div className="card shadow-sm flex-grow-1">
                        <div className="card-header">
                            <h4>Datos Básicos</h4>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmitBasicInfo}>
                                <div className="mb-3">
                                    <label htmlFor="nombre" className="form-label">Nombre</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="nombre"
                                        name="nombre"
                                        value={userData.nombre}
                                        onChange={handleBasicInfoChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="apellido" className="form-label">Apellido</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="apellido"
                                        name="apellido"
                                        value={userData.apellido}
                                        onChange={handleBasicInfoChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="direccion" className="form-label">Dirección</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="direccion"
                                        name="direccion"
                                        value={userData.direccion}
                                        onChange={handleBasicInfoChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="correo" className="form-label">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        className="form-control email-readonly-custom"
                                        id="correo"
                                        name="correo"
                                        value={userData.correo}
                                        onChange={handleBasicInfoChange}
                                        required
                                        readOnly
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">Actualizar Información</button>
                            </form>
                        </div>
                    </div>
                </Col>

                <Col md={1} className="d-none d-md-flex align-items-center justify-content-center">
                    <div className="vertical-divider"></div>
                </Col>

                <Col md={5} className="d-flex flex-column">
                    <div className="card shadow-sm flex-grow-1">
                        <div className="card-header">
                            <h4>Cambiar Contraseña</h4>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmitPassword}>
                                <div className="mb-3">
                                    <label htmlFor="current_password" className="form-label">Contraseña Actual</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="current_password"
                                        name="current_password"
                                        value={passwordData.current_password}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="new_password" className="form-label">Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="new_password"
                                        name="new_password"
                                        value={passwordData.new_password}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength="8"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="new_password_confirmation" className="form-label">Confirmar Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="new_password_confirmation"
                                        name="new_password_confirmation"
                                        value={passwordData.new_password_confirmation}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength="8"
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">Cambiar Contraseña</button>
                            </form>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default MiCuenta;