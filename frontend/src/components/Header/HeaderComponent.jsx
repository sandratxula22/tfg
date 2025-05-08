import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import LogoutButton from '../Login/LogoutButton';
import './Header.css';

function HeaderComponent() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const handleLogoutSuccess = () => {
        setIsLoggedIn(false);
        navigate('/');
    };

    return (
        <Navbar variant="dark" expand="lg" className="mb-4 bg-primary-500">
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
                    </Nav>
                    <Nav className="ml-auto">
                        {isLoggedIn ? (
                            <LogoutButton onLogout={handleLogoutSuccess} className="text-white" />
                        ) : (
                            <Nav.Link as={Link} to="/login" className="text-white">
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