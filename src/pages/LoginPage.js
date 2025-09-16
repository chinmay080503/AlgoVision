// LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isDark, setIsDark] = useState(() => {
    return JSON.parse(localStorage.getItem("isDark")) || false;
  });
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("isDark", JSON.stringify(newTheme));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLogin) {
      // Login logic
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => 
        (u.username === formData.username || u.email === formData.username) && 
        u.password === formData.password
      );
      
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.dispatchEvent(new Event('userLoggedIn'));
        navigate('/dashboard');
      } else {
        alert('Invalid credentials');
      }
    } else {
      // Signup logic
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if user already exists
      if (users.some(u => u.username === formData.username)) {
        alert('Username already exists');
        return;
      }
      
      if (users.some(u => u.email === formData.email)) {
        alert('Email already registered');
        return;
      }
      
      // Add new user
      const newUser = {
        id: Date.now(),
        ...formData,
        joinDate: new Date().toISOString()
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      // Update JSON file (simulated)
      updateUsersJson(users);
      
      window.dispatchEvent(new Event('userLoggedIn'));
      navigate('/dashboard');
    }
  };

  // This function would typically make an API call to update a JSON file
  // For this example, we'll simulate it by storing in localStorage
  const updateUsersJson = (users) => {
    localStorage.setItem('usersJson', JSON.stringify(users));
    console.log('Users JSON updated:', users);
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="login-form">
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label>{isLogin ? 'Username or Email' : 'Username'}</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="login-btn">
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              className="toggle-form" 
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign up' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;