import { useState } from 'react';
import './App.css';
import Button from './components/Button';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Logika validasi sederhana
    if (username && password) {
      setIsLoggedIn(true);
    } else {
      alert('Silakan isi username dan password!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  // Tampilan setelah login berhasil
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Selamat Datang!</h1>
          <p className="text-gray-600 mb-6 text-center">
            Anda berhasil login sebagai <span className="font-bold">{username}</span>
          </p>
          <div className="flex justify-center">
            <Button text="Logout" onClick={handleLogout} type="danger" />
          </div>
        </div>
      </div>
    );
  }

  // Tampilan form login
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h1>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan username"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan password"
            />
          </div>
          
          {/* Contoh penggunaan Component */}
          <div className="flex items-center justify-between">
            <Button text="Login" type="primary" onClick={handleLogin} />
            <Button 
              text="Batal" 
              type="primary" 
              onClick={() => {
                setUsername('');
                setPassword('');
              }} 
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;