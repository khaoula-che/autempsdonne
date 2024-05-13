import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/signup.css';  
import logo from '../assets/logo.png';  
import img from '../assets/ins_img.png';

function SignupSuccess() {

    return (
        <>
            <header>
                <img src={logo} alt="Your Logo" className="logo" />
            </header>
            <div className="form-box">
            <center>
                <div className="breadcrumb">
                    {Array.from({ length: 5 }, (_, i) => i % 2 === 0 ? (
                        <div className="dot" key={i}></div>
                    ) : (
                        <div className="line" key={i}></div>
                    ))}
                </div>
                </center>
                <div>
                <center>
                    <h1 >Inscription</h1>
                    </center>
                    <center><img style={{marginTop:'30px', width:'300px'}}src={img}/></center>
                    <center><p style={{marginTop:'50px', color:'#EB5454'}}>Votre candidature a été bien transmise. Nous vous remercions pour votre intérêt et vous contacterons bientôt.</p></center>
                                        
                </div>
            </div>
        </>
    );
}

export default SignupSuccess;
