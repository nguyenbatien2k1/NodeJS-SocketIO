import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import socketIOClient from "socket.io-client";

import './Login.scss';

const host = 'http://localhost:8080/';

function Login() {
   
   const [id, setId] = useState();
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [isShowPassword, setIsShowPassword] = useState(false);
   const [errMessage, setErrMessage] = useState('');

   const socketRef = useRef();

   const navigate = useNavigate();

   useEffect(() => {
        socketRef.current = socketIOClient.connect(host);

        socketRef.current.on('getId', data => {
            setId(data)
        })

        return () => {
            socketRef.current.disconnect();
        };
   }, [])

    const handleEventShowHidePassword = () => {
        setIsShowPassword(!isShowPassword);
    }

    const handleClickLogin = () => {
        setErrMessage('');

        if(username && password) {
            socketRef.current.emit('client-send-username', {
                username,
                password
            });

            socketRef.current.on('server-send-username-success', data => {
                setErrMessage('Đăng nhập thành công ! Vui lòng chờ...')
                navigate('/chatroom');
            })

            socketRef.current.on('server-send-username-failed', () => {
                setErrMessage('Thông tin tài khoản hoặc mật khẩu không chính xác!')
            })
        }
        else {
            setErrMessage('Vui lòng điền đầy đủ thông tin!')
        }
    }

    const handleEventKeyDown = (e) => {
        if(e.key === 'Enter' || e.keyCode === 13) {
            handleClickLogin();
        }
    }
    
   return (
        <>
            <div className='login-background'>
                <div className='login-container'>
                    <div className='login-content row'>
                        <div className='col-12 text-center login-text'>Login</div>
                        
                        <div className='col-12 form-group login-input'>
                            <label htmlFor='username'>User name</label>
                            <input 
                                type='text' 
                                className='form-control' 
                                id='username'
                                name='username'
                                placeholder='Enter your username...'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)} 
                                onKeyDown={(e) => handleEventKeyDown(e)}
                                />
                        </div>
                        
                        <div className='col-12 form-group login-input'>
                            <label htmlFor='password'>Password</label>
                            <div className='custom-input-password'>
                                <input
                                    className='form-control' 
                                    type={isShowPassword ? 'text' : 'password'} 
                                    id='password' 
                                    name='password'
                                    placeholder='Enter your password...'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => handleEventKeyDown(e)}
                                />
                                <span
                                    onClick={() => handleEventShowHidePassword()}
                                >
                                    <i className={isShowPassword ? 'fas fa-eye' : 'fas fa-eye-slash'}></i>  
                                </span>
                            </div>
                        </div>

                        <div className='col-12' style={{color: "red"}}>{errMessage}</div>
                        <div className='col-12'>
                            <button 
                                className='btn-login'
                                onClick={(e) => handleClickLogin(e)}
                                >
                                    Login
                            </button>
                        </div>

                        <div className='col-12'>
                            <span className='forgot-password'>Forgot your password?</span>
                        </div>

                        <div className='col-12 text-center mt-3'>
                            <span className='other-login'>Or Login With:</span>
                        </div>

                        <div className='col-12 login-social'>
                            <i className="fab fa-facebook-f facebook"></i>
                            <i className="fab fa-google google"></i>
                        </div>
                    </div>
                </div>
            </div>
        </>
   )
}

export default Login;