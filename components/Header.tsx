
import React from 'react';
import { MicIcon, StopCircleIcon } from './Icons';

interface HeaderProps {
    isListening: boolean;
    onToggleListening: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isListening, onToggleListening }) => {
    return (
        <header className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 shadow-md">
            <h1 className="text-xl font-bold text-white">Conversational Intelligence Assistant</h1>
            <button
                onClick={onToggleListening}
                className={`flex items-center justify-center px-4 py-2 rounded-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
                    ${isListening 
                        ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500'
                    }`}
            >
                {isListening ? (
                    <>
                        <StopCircleIcon className="w-5 h-5 mr-2" />
                        Stop Listening
                    </>
                ) : (
                    <>
                        <MicIcon className="w-5 h-5 mr-2" />
                        Start Listening
                    </>
                )}
            </button>
        </header>
    );
};
