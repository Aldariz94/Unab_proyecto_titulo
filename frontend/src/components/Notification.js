// frontend/src/components/Notification.js
import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const Notification = ({ message, type, isOpen }) => {
    if (!isOpen) return null;

    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900';
    const textColor = isSuccess ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200';
    const Icon = isSuccess ? CheckCircleIcon : XCircleIcon;

    return (
        // Se elimina la clase 'fixed' y se usan clases de margen
        <div className={`my-4 p-4 rounded-lg shadow-md ${bgColor}`}>
            <div className={`flex items-center ${textColor}`}>
                <Icon className="w-6 h-6 mr-3" />
                <span className="font-medium">{message}</span>
            </div>
        </div>
    );
};

export default Notification;