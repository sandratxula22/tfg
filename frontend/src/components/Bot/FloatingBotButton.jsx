import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faTimes } from '@fortawesome/free-solid-svg-icons'; // Importamos el icono de cerrar
import Bot from './Bot'; // Asegúrate de que esta ruta sea correcta desde este archivo

function FloatingBotButton() {
    const [isOpen, setIsOpen] = useState(false); // Estado para controlar si el bot está abierto/cerrado

    const toggleBot = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Botón flotante para abrir el chat */}
            {!isOpen && ( // Solo muestra el botón si el chat está cerrado
                <button
                    onClick={toggleBot}
                    className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 z-50 transition-all duration-300 transform hover:scale-110"
                    // Esto oculta el botón en pantallas pequeñas, si prefieres que solo esté en desktop
                    // d-none d-md-block (si usas Bootstrap) o hidden md:block (si usas Tailwind)
                >
                    <FontAwesomeIcon icon={faRobot} size="2x" />
                </button>
            )}

            {/* Contenedor flotante del chat del bot */}
            {isOpen && (
                <div className="fixed bottom-4 right-4 z-50 transform transition-all duration-300 ease-in-out scale-100 opacity-100">
                    <div className="relative bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-lg h-[600px] flex flex-col">
                        {/* Botón de cerrar (X) dentro del chat */}
                        <button
                            onClick={toggleBot}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl z-50 focus:outline-none"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>

                        <Bot /> {/* Renderiza tu componente Bot aquí */}
                    </div>
                </div>
            )}
        </>
    );
}

export default FloatingBotButton;