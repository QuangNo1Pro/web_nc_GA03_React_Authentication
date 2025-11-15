import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

type FormValues = {
  email: string;
  password: string;
};

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const navigate = useNavigate();
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  // cast to any to satisfy TS for mutation status props
  const mutation = useMutation<any, any, FormValues, unknown>({
    mutationFn: (data: FormValues) => api.post('/user/register', data).then(res => res.data),
    onSuccess: (data) => {
      setServerMessage('Đăng ký thành công — chuyển hướng tới Login...');
      setTimeout(() => navigate('/login'), 1200);
    },
    onError: (err: any) => {
      setServerMessage((err?.response?.data?.message) || 'Lỗi khi đăng ký');
    },
  }) as any;

  const onSubmit = (data: FormValues) => {
    setServerMessage(null);
    mutation.mutate(data);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-8">
      <h2 className="text-xl font-semibold mb-4">Sign Up</h2>

      {serverMessage && (
        <div className={`p-2 rounded mb-4 ${mutation.isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {serverMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="input"
            {...register('email', { required: 'Email là bắt buộc', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email không hợp lệ' } })}
            placeholder="you@example.com"
            aria-label="Email"
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="input"
            {...register('password', { required: 'Mật khẩu là bắt buộc', minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' } })}
            placeholder="Mật khẩu"
            aria-label="Password"
          />
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <button
            type="submit"
            disabled={mutation.isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
          >
            {mutation.isLoading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </div>
      </form>
    </div>
  );
}
