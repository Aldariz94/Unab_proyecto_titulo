import { useState, useCallback } from 'react';

export const useNotification = () => {
    const [notification, setNotification] = useState({
        message: '',
        type: '',
        isOpen: false,
    });

    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type, isOpen: true });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, isOpen: false }));
        }, 10000);
    }, []);

    return { notification, showNotification };
};