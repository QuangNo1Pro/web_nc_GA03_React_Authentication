
import React from 'react';

import { useForm } from 'react-hook-form';

import { useNavigate } from 'react-router-dom';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '../services/api';

import { useAuth } from '../auth/auth';



type FormValues = { email: string; password: string };



export default function Login() {

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const navigate = useNavigate();

  const { login } = useAuth();

  const [serverMessage, setServerMessage] = React.useState<string | null>(null);

  const queryClient = useQueryClient();



  const mutation = useMutation<any, any, FormValues, unknown>({

    mutationFn: (data: FormValues) => api.post('/auth/login', data).then(res => res.data),

    onSuccess: (data) => {

      login(data.access_token, data.refresh_token);

      queryClient.invalidateQueries({ queryKey: ['profile'] });

      setServerMessage('Đăng nhập thành công');

      setTimeout(() => navigate('/dashboard'), 800);

    },

    onError: (err: any) => {

      setServerMessage((err?.response?.data?.message) || 'Lỗi khi đăng nhập');

    },

  });



  const onSubmit = (data: FormValues) => {

    setServerMessage(null);

    mutation.mutate(data);

  };



  return (

    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-8">

      <h2 className="text-xl font-semibold mb-4">Login</h2>



      {serverMessage && <div className={`p-2 rounded mb-4 ${mutation.isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{serverMessage}</div>}



      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

        <div>

          <label htmlFor="login-email" className="block text-sm font-medium mb-1">Email</label>

          <input

            id="login-email"

            type="email"

            className="input"

            placeholder="you@example.com"

            aria-label="Email"

            {...register('email', { required: 'Email là bắt buộc' })}

          />

          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}

        </div>



        <div>

          <label htmlFor="login-password" className="block text-sm font-medium mb-1">Password</label>

          <input

            id="login-password"

            type="password"

            className="input"

            placeholder="Mật khẩu"

            aria-label="Password"

            {...register('password', { required: 'Mật khẩu là bắt buộc' })}

          />

          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}

        </div>



        <div>

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded" disabled={mutation.isLoading}>

            {mutation.isLoading ? 'Đang xử lý...' : 'Login'}

          </button>

        </div>

      </form>

    </div>

  );

}
