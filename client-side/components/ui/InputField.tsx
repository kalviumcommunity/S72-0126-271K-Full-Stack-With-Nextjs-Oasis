import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
    label,
    error,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || props.name;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'
                    } ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};
