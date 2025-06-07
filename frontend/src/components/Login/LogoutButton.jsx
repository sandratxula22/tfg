import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

function LogoutButton({ children, className }) {
    const navigate = useNavigate();
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const { logout } = useAuth();

    const handleLogout = async () => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Cerrarás tu sesión actual.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cerrar sesión'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('authToken');
                    const response = await fetch(`${VITE_API_BASE_URL}/api/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (response.ok) {
                        logout();
                        Swal.fire(
                            '¡Sesión cerrada!',
                            'Has cerrado tu sesión con éxito.',
                            'success'
                        );
                        navigate('/');
                    } else {
                        const errorData = await response.json();
                        console.error('Error al cerrar sesión:', errorData.message || 'Error desconocido');
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al cerrar sesión',
                            text: errorData.message || 'Hubo un problema al cerrar tu sesión en el servidor. Puede que tu sesión ya haya expirado.',
                        });
                        logout();
                        navigate('/');
                    }
                } catch (error) {
                    console.error('Error al comunicarse con el servidor para cerrar sesión:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de conexión',
                        text: 'No se pudo conectar al servidor para cerrar sesión. Por favor, inténtalo de nuevo.',
                    });
                    logout();
                    navigate('/');
                }
            }
        });
    };

    return (
        <button onClick={handleLogout} className={className}>
            {children}
        </button>
    );
}

export default LogoutButton;