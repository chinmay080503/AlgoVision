// LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import "./LoginPage.css";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
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
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.some(u => u.username === formData.username)) { alert('Username already exists'); return; }
      if (users.some(u => u.email === formData.email)) { alert('Email already registered'); return; }
      const newUser = { id: Date.now(), ...formData, joinDate: new Date().toISOString() };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      localStorage.setItem('usersJson', JSON.stringify(users));
      window.dispatchEvent(new Event('userLoggedIn'));
      navigate('/dashboard');
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
    exit: { opacity: 0, y: -50, scale: 0.95, transition: { duration: 0.3 } }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.4, type: "spring", stiffness: 100 } })
  };

  return (
    <div className="login-container">
      <motion.nav 
        className="login-nav"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button 
          className="back-home-btn"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back to Home
        </motion.button>
      </motion.nav>

      <div className="login-form-container">
        <motion.div
          className="login-form"
          key={isLogin ? 'login' : 'signup'}
          variants={formVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </motion.h2>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <motion.div className="form-group" custom={0} variants={inputVariants} initial="hidden" animate="visible">
                <label>Email</label>
                <motion.input type="email" name="email" value={formData.email} onChange={handleChange} required whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }} />
              </motion.div>
            )}

            <motion.div className="form-group" custom={isLogin ? 0 : 1} variants={inputVariants} initial="hidden" animate="visible">
              <label>{isLogin ? 'Username or Email' : 'Username'}</label>
              <motion.input type="text" name="username" value={formData.username} onChange={handleChange} required whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }} />
            </motion.div>

            <motion.div className="form-group" custom={isLogin ? 1 : 2} variants={inputVariants} initial="hidden" animate="visible">
              <label>Password</label>
              <motion.input type="password" name="password" value={formData.password} onChange={handleChange} required whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }} />
            </motion.div>

            <motion.button 
              type="submit" 
              className="login-btn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
              whileHover={{ scale: 1.02, y: -2, boxShadow: "0 8px 20px rgba(0, 78, 146, 0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </motion.button>
          </form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.4 }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <motion.span className="toggle-form" onClick={() => setIsLogin(!isLogin)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              {isLogin ? 'Sign up' : 'Login'}
            </motion.span>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;