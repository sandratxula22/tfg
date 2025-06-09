import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import LogoutButton from '../Login/LogoutButton';
import './Header.css';
import { useAuth } from '../../contexts/AuthContext';

function HeaderComponent() {
    const navigate = useNavigate();
    const { isAuthenticated, userRole, logout, loadingAuth } = useAuth();

    const handleLogoutSuccess = () => {
        logout();
        navigate('/');
    };

    return (
        <Navbar expand="lg" className="navbar-custom shadow-md py-3">
            <Container>
                <Navbar.Brand as={Link} to="/" className="flex items-center">
                    <img
                        alt="La Página Doblada Logo"
                        src={`/img/logo_horizontal.png`}
                        className="d-inline-block align-top navbar-logo-horizontal"
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" className="text-white" />
                <Navbar.Collapse id="basic-navbar-nav" className="navbar-collapse-custom">
                    <Nav className="navbar-nav-left-group">
                        <Nav.Link as={Link} to="/peticiones" className="nav-icon-link nav-peticiones-desktop-text">
                            <span className="material-symbols-outlined nav-icon">mail</span>
                            <span className="nav-text-mobile">Peticiones</span> 
                        </Nav.Link>
                    </Nav>

                    <Nav className="navbar-nav-right-group">
                        {userRole === 'admin' && (
                            <Nav.Link as={Link} to="/admin" className="nav-icon-link">
                                <span className="material-symbols-outlined nav-icon">admin_panel_settings</span>
                                <span>Panel de Admin</span>
                            </Nav.Link>
                        )}
                        {isAuthenticated && (
                            <>
                                <Nav.Link as={Link} to="/carrito" className="nav-icon-link">
                                    <span className="material-symbols-outlined nav-icon">shopping_cart</span>
                                    <span className="nav-text-mobile">Carrito</span>
                                </Nav.Link>
                                <Nav.Link as={Link} to="/pedidos" className="nav-icon-link">
                                    <span className="material-symbols-outlined nav-icon">receipt_long</span>
                                    <span className="nav-text-mobile">Mis Pedidos</span>
                                </Nav.Link>
                                <Nav.Link as={Link} to="/mi-cuenta" className="nav-icon-link">
                                    <span className="material-symbols-outlined nav-icon">person</span>
                                    <span className="nav-text-mobile">Mi Cuenta</span>
                                </Nav.Link>
                            </>
                        )}
                        {!loadingAuth ? (
                            isAuthenticated ? (
                                <LogoutButton className="nav-icon-link">
                                    <span className="material-symbols-outlined nav-icon" data-icon="logout">logout</span>
                                    <span className="nav-text-mobile">Cerrar Sesión</span>
                                </LogoutButton>
                            ) : (
                                <Nav.Link as={Link} to="/login" className="nav-icon-link">
                                    <span className="material-symbols-outlined nav-icon" data-icon="login">login</span>
                                    <span className="nav-text-mobile">Iniciar Sesión</span>
                                </Nav.Link>
                            )
                        ) : (
                            <div className="spinner-container">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default HeaderComponent;