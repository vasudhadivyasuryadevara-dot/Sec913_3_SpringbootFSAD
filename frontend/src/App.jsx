import { useEffect, useRef, useState } from 'react';
import { imgurl, callApi, apibaseurl } from './lib';
import './App.css';
import ProgressBar from './components/ProgressBar.jsx';

const App = () => {
    const [isSignin, setIsSignIn] = useState(true);
    const finput = useRef();
    const [isProgress, setIsProgress] = useState(false);
    const [errorData, setErrorData] = useState({});
    const [roles, setRoles] = useState([
        { role: 1, rolename: "User" },
        { role: 2, rolename: "Manager" },
        { role: 3, rolename: "Admin" }
    ]);

    const [signupData, setSignupData] = useState({
        fullname: "",
        phone: "",
        email: "",
        role: "1",
        password: "",
        retypepassword: ""
    });

    const [signinData, setSigninData] = useState({
        username: "",
        password: ""
    });

    useEffect(()=>{
        setTimeout(() => {finput.current?.focus();}, 0);
    }, [isSignin]);

    useEffect(()=>{
        callApi("GET", apibaseurl + "/roles", null, null, rolesResponseHandler);
    }, []);

    function switchWindow(){
        setIsSignIn(prev => !prev);
        setErrorData({});
        setSigninData({
            username: "",
            password: ""
        });

        setSignupData({
            fullname: "",
            phone: "",
            email: "",
            role: "1",
            password: "",
            retypepassword: ""
        });
    }

    function handleSigninInput(e){
        const {name, value} = e.target;
        setSigninData({...signinData, [name]: value});
    }

    function handleSignupInput(e){
        const {name, value} = e.target;
        setSignupData({...signupData, [name]: value});
    }

    function validateSignup(){
        let errors = {};
        if(signupData.fullname === "") errors.fullname = true;
        if(signupData.phone === "") errors.phone = true;
        if(signupData.email === "") errors.email = true;
        if(signupData.role === "") errors.role = true;
        if(signupData.password === "") errors.password = true;
        if(signupData.retypepassword === "" || signupData.password !== signupData.retypepassword) errors.retypepassword = true;
        setErrorData(errors);
        return Object.keys(errors).length > 0;
    }

    function validateSignin(){
        let errors = {};
        if(signinData.username === "") errors.username = true;
        if(signinData.password === "") errors.password = true;
        setErrorData(errors);
        return Object.keys(errors).length > 0;
    }

    function signin(){
        /*Connect backend using callApi() function from lib.js
        Refer lib.js for callApi() parameters*/
        if(validateSignin())
            return;

        setIsProgress(true);
        callApi("POST", apibaseurl + "/authservice/signin", signinData, null, signinResponseHandler);
    }

    function signup(){
        /*Connect backend using callApi() function from lib.js
        Refer lib.js for callApi() parameters*/
        if(validateSignup())
            return;

        setIsProgress(true);
        callApi("POST", apibaseurl + "/authservice/signup", signupData, null, signupResponseHandler);
    }

    function signinResponseHandler(res){
        if(res.code != 200)
            alert(res.message);
        else{
            localStorage.setItem("token", res.jwt);     
            window.location.replace("/home");
        }  
        setIsProgress(false);
    }

    function signupResponseHandler(res){
        alert(res.message);
        setIsProgress(false);
        setSignupData({
            fullname: "",
            phone: "",
            email: "",
            role: "1",
            password: "",
            retypepassword: ""
        });
        finput.current?.focus();
    }

    function rolesResponseHandler(res){
        if(res.code === 200 && Array.isArray(res.roles) && res.roles.length > 0)
            setRoles(res.roles);
    }
    return (
        <div className='app'>
            <div className={isSignin ? 'container signin-card' : 'container signup-card'} key={isSignin ? "signin" : "signup"}>
                {(
                    <div className='auth-visual' aria-hidden='true'>
                        <div className='graphic-orbit'></div>
                        <span className='sparkle sparkle-one'></span>
                        <span className='sparkle sparkle-two'></span>
                        <span className='sparkle sparkle-three'></span>
                        <span className='glow-dot glow-one'></span>
                        <span className='glow-dot glow-two'></span>
                        <div className='chat-bubble'><span></span></div>
                        <div className='lock-bubble'><span></span></div>
                        <div className='check-bubble'>✓</div>
                        <div className='girl'>
                            <div className='hair'></div>
                            <div className='face'>
                                <span className='eye left'></span>
                                <span className='eye right'></span>
                                <span className='smile'></span>
                            </div>
                            <div className='hoodie'></div>
                            <div className='phone'></div>
                        </div>
                    </div>
                )}
                <div className='container-header'>
                    <label>{isSignin ? "Welcome Back!": "Create Account"}</label>
                    <span>{isSignin ? "Login to continue" : "Sign up to get started"}</span>
                </div>
                <div className='container-content'>
                    {isSignin ? 
                        <>
                        <label>Username*</label>
                        <div className='input-group'>
                            <img src={imgurl + "user.png"} alt='user' />
                            <input type='text' ref={finput} className={errorData.username ? 'error' : ''} placeholder='Username' autoComplete='off' name="username" value={signinData.username} onChange={(e)=>handleSigninInput(e)} />
                        </div>
                        <label>Password*</label>
                        <div className='input-group'>
                            <img src={imgurl + "padlock.png"} alt='padlock' />
                            <input type='password' className={errorData.password ? 'error' : ''} placeholder='Password' name='password' value={signinData.password} onChange={(e)=>handleSigninInput(e)} />
                        </div>
                        <button type='button' onClick={()=>signin()}>Submit</button>
                        <div className='form-help-row forgot-row'>
                            <span className='link-text'>Forgot Password?</span>
                        </div>
                        <div className='signup-switch-row'>
                            <span>Don't have an account?</span>
                            <button type='button' onClick={()=>switchWindow()}>Sign Up</button>
                        </div>
                        </>
                    :
                        <>
                        <label>Full Name*</label>
                        <div className='input-group'>
                            <img src={imgurl + "user.png"} alt='user' />
                            <input type='text' ref={finput} className={errorData.fullname ? 'error' : ''}  placeholder='Full name' autoComplete='off' name='fullname' value={signupData.fullname} onChange={(e)=>handleSignupInput(e)} />
                        </div>
                        <label>Mobile Number*</label>
                        <div className='input-group'>
                            <img src={imgurl + "phone.png"} alt='phone' />
                            <input type='text' className={errorData.phone ? 'error' : ''} placeholder='Mobile number' autoComplete='off' name='phone' value={signupData.phone} onChange={(e)=>handleSignupInput(e)} />
                        </div>
                        <label>Email Address*</label>
                        <div className='input-group'>
                            <img src={imgurl + "email.png"} alt='email' />
                            <input type='text' className={errorData.email ? 'error' : ''} placeholder='Email address' autoComplete='off' name='email' value={signupData.email} onChange={(e)=>handleSignupInput(e)} />
                        </div>
                        <label>Role*</label>
                        <div className='input-group'>
                            <img src={imgurl + "user.png"} alt='role' />
                            <select className={errorData.role ? 'error' : ''} name='role' value={signupData.role} onChange={(e)=>handleSignupInput(e)}>
                                {roles.map((role)=>(
                                    <option key={role.role} value={role.role}>{role.rolename}</option>
                                ))}
                            </select>
                        </div>
                        <label>Password*</label>
                        <div className='input-group'>
                            <img src={imgurl + "padlock.png"} alt='padlock' />
                            <input type='password' className={errorData.password ? 'error' : ''} placeholder='Password' autoComplete='off' name='password' value={signupData.password} onChange={(e)=>handleSignupInput(e)} />
                        </div>
                        <label>Re-type Password*</label>
                        <div className='input-group'>
                            <img src={imgurl + "padlock.png"} alt='padlock' />
                            <input type='password' className={errorData.retypepassword ? 'error' : ''} placeholder='Confirm password' autoComplete='off' name='retypepassword' value={signupData.retypepassword} onChange={(e)=>handleSignupInput(e)} />
                        </div>
                        <button type='button' onClick={()=>signup()}>Register</button>
                        <div className='form-help-row'>
                            <span>Already have an account?</span>
                            <span className='link-text' onClick={()=>switchWindow()}>Sign in</span>
                        </div>
                        </>
                    }
                </div>
                <div className='container-footer'>Copyright 2500030124</div>
            </div>

            <ProgressBar isProgress={isProgress}/>
        </div>
    );
}

export default App;
