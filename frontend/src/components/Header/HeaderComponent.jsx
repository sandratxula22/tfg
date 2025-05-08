import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import LogoutButton from '../Login/LogoutButton';
import './Header.css';

function HeaderComponent() {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    const handleLogoutSuccess = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/');
        window.dispatchEvent(new Event('storage'));
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
                    <Nav className="ml-auto">
                        {isLoggedIn ? (
                            <LogoutButton onLogout={handleLogoutSuccess} />
                        ) : (
                            <Nav.Link as={Link} to="/login">
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