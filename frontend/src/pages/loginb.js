import React, { useState } from 'react';
import Logo from '../assets/logo.png';
import '../css/loginb.css';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const performLogin = async (role) => {
        const url = ` https://au-temps-donne-api.onrender.com/api/${role}/login`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            if (!response.ok) {
                if (role === 'beneficiary' && response.status === 404) {
                    return false;
                }
                throw new Error('Failed to log in. Please check your credentials and try again.');
            }

            const json = await response.json();
            localStorage.setItem('accessToken', json.accessToken);
            localStorage.setItem('userType', json.userType);

            const redirectPath = json.statut_validation === 'en attente' ? '/candidat' : `/${role}/dashboard`;
            window.location.href = redirectPath;
            return true; 
        } catch (err) {
            console.error(`There was a problem with the ${role} login:`, err);
            throw err; 
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email || !password) {
            setError('Email and password are required');
            return;
        }

        setError(null); 

        try {
            const loggedIn = await performLogin('beneficiary');
            if (!loggedIn) {
                await performLogin('volunteer');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className='loginbbody'>
            <header>
                <img src={Logo} alt="Your Logo" className="logo" />
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Connexion</h1>
                <p><strong>Vous n'avez pas de compte ? <a href="/signupb">Inscrivez-vous</a></strong></p>
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
    );
}

export default LoginForm;
