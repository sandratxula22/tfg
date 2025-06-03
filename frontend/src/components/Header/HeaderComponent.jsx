import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import LogoutButton from '../Login/LogoutButton';
import './Header.css';
import { useAuth } from '../../contexts/AuthContext';

function HeaderComponent() {
    const navigate = useNavigate();
    const { isAuthenticated, userRole, logout } = useAuth();

    const handleLogoutSuccess = () => {
        logout();
        navigate('/');
    };

    return (
        <Navbar variant="dark" expand="lg" className="bg-primary-500">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    <img
                        alt=""
                        src={`${import.meta.env.VITE_API_BASE_URL}/img/logo.png`}
                        width="30"
                        height="30"
                        className="d-inline-block align-top"
                    />
                    {' '}La Página Doblada
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Inicio</Nav.Link>
                        {userRole === 'admin' && (
                            <Nav.Link as={Link} to="/admin">Panel de Admin</Nav.Link>
                        )}
                    </Nav>
                    <Nav className="ml-auto align-items-center">
                        {isAuthenticated && (
                            <Nav.Link as={Link} to="/carrito" className="p-0">
                                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'white' }}>
                                    shopping_cart
                                </span>
                            </Nav.Link>
                        )}
                        {isAuthenticated ? (
                            <LogoutButton onLogout={handleLogoutSuccess} className="ms-2" />
                        ) : (
                            <Nav.Link as={Link} to="/login" className="ms-2">
                                Iniciar Sesión
                            </Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default HeaderComponent;