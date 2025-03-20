import React, { useState } from 'react';
import axios from 'axios';

interface RegisterProps {
  onRegister: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      await axios.post('http://localhost:3000/users', { email, password });
      setSuccess('Cadastro realizado com sucesso!');
      setTimeout(() => onRegister(), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao cadastrar');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-green-600">Cadastro</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirme a Senha"
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}
        {success && <p className="text-green-500 mb-3 text-sm">{success}</p>}
        <button type="submit" className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 transition-all">
          Cadastrar
        </button>
        <button type="button" className="w-full mt-3 bg-gray-300 text-gray-700 p-3 rounded hover:bg-gray-400 transition-all" onClick={onRegister}>
          Voltar para Login
        </button>
      </form>
    </div>
  );
};

export default Register;
