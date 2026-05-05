import React, { useState } from 'react';
import axios from 'axios';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mode = isLogin ? 'login' : 'signup';
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/${mode}`, formData);
      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        onLogin(res.data.user);
      } else {
        alert("Registration done! Now please Login.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response.data.error || "Something went wrong");
    }
  };

  return (
   <div style={{display:"flex",alignItems:"center",justifyContent:"center ", }}>
     <div className="auth-box" style={{boxShadow:" 0 4px 10px rgba(0,0,0,0.1)",backgroundColor:"white",borderRadius:"20px",padding:"1%",marginTop:"5%"}} >
      <h2>{isLogin ? "Welcome Back" : "Join Metro App"}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input type="text" placeholder="Full Name" onChange={e => setFormData({...formData, name: e.target.value})} />
        )}
        {!isLogin && (
          <input type="tel" placeholder="Mobile Number" onChange={e => setFormData({...formData, mobile: e.target.value})} />
        )}
        <input type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} />
        
        <button type="submit">{isLogin ? "Sign In" : "Sign Up"}</button>
      </form>
      <p onClick={() => setIsLogin(!isLogin)} style={{cursor:'pointer', color: 'blue'}}>
        {isLogin ? "First time? Create account" : "Already have an account? Sign In"}
      </p>
    </div>
   </div>
  );
}