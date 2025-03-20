import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import Tasks from './Tasks';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false);

  if (isLoggedIn) {
    return <Tasks />;
  }

  return showRegister ? (
    <Register onRegister={() => setShowRegister(false)} />
  ) : (
    <div>
      <Login onLogin={() => setIsLoggedIn(true)} />
      <p className="text-center mt-4 text-sm">
        Não tem conta?{' '}
        <button className="text-blue-500 underline" onClick={() => setShowRegister(true)}>
          Cadastre-se
        </button>
      </p>
    </div>
  );
}

export default App;
