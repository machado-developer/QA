import React from 'react';
import 'tailwindcss/tailwind.css';

const Loading: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 mb-4"></div>
            <p className="text-lg text-gray-700">Carregando...</p>
        </div>
    );
};

export default Loading;