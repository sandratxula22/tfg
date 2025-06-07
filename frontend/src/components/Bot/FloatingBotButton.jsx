import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import Bot from './Bot';

function FloatingBotButton() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleBot = () => {
        setIsOpen(!isOpen);
    };

    const handleCloseBot = () => {
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isOpen && (
                <button
                    onClick={toggleBot}
                    className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-110"
                >
                    <FontAwesomeIcon icon={faRobot} size="2x" />
                </button>
            )}

            {isOpen && (
                <div className="mb-3">
                    <Bot onClose={handleCloseBot} />
                </div>
            )}
        </div>
    );
}

export default FloatingBotButton;