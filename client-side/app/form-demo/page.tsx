'use client';

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '@/components/ui/FormInput';
import { Button, Card } from '@/components';

// 1. Define Zod Schema
const registrationSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

// 2. Infer TypeScript Type from Schema
type RegistrationFormInputs = z.infer<typeof registrationSchema>;

export default function FormDemoPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<RegistrationFormInputs>({
        resolver: zodResolver(registrationSchema),
    });

    const onSubmit: SubmitHandler<RegistrationFormInputs> = async (data) => {
        // Simulate API call
        console.log('Submitting Form Data:', data);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        alert(JSON.stringify(data, null, 2));
        reset();
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">📋 Form Handling</h1>
                <p className="text-gray-600">
                    React Hook Form + Zod Validation
                </p>
            </div>

            <Card title="Register Account">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormInput
                        label="Username"
                        placeholder="johndoe"
                        registration={register('username')}
                        error={errors.username?.message}
                    />

                    <FormInput
                        label="Email"
                        type="email"
                        placeholder="john@example.com"
                        registration={register('email')}
                        error={errors.email?.message}
                    />

                    <FormInput
                        label="Password"
                        type="password"
                        placeholder="******"
                        registration={register('password')}
                        error={errors.password?.message}
                    />

                    <FormInput
                        label="Confirm Password"
                        type="password"
                        placeholder="******"
                        registration={register('confirmPassword')}
                        error={errors.confirmPassword?.message}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        disabled={isSubmitting}
                        variant={isSubmitting ? 'secondary' : 'primary'}
                    >
                        {isSubmitting ? 'Registering...' : 'Register'}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
