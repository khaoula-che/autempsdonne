import React, { useState } from 'react';
import '../css/loginb.css';
import Logo from '../assets/logo.png';

function Loginc() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handlePrtnerLogin = async () => {
        try {
            const response = await fetch(" https://au-temps-donne-api.onrender.com/api/partenaire/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include' 
            });

        if (response.ok) {
            const json = await response.json();
            localStorage.setItem('accessToken', json.accessToken);
            localStorage.setItem('userType', json.userType);

            window.location.href = '/partner/dashboard';
            return;
        } else {
            throw new Error('Failed to log in. Please check your credentials and try again.');
        }
        } catch (error) {
            console.error('There was a problem with the partner login:', error);
            setError('Failed to log in. Please check your credentials and try again.');
        }
    };
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email || !password) {
            setError('Email and password are required');
            return;
        }

        handlePrtnerLogin();
    };
    return (
        <div class='loginbbody'>
        <div>
            <header>
                <img src={Logo} alt="Your Logo" className="logo" />
            </header>
            <form onSubmit={handleSubmit}>
            <h2 id="title-ad">Connexion partenaire</h2>
                <div className="form-group">
                    <div className="input-group email">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                </div>
                <div className="form-group">
                    <div className="input-group">
                        <label htmlFor="password">Mot de passe:</label>
                        <input type="password" id="password" name="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit">Suivant</button>
            </form>
        </div>
        </div>
    );
}

export default Loginc;
