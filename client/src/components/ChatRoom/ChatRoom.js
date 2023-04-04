import { useEffect, useRef, useState } from 'react';
import socketIOClient from "socket.io-client";
import './ChatRoom.scss'

const host = 'http://localhost:8080/'

function ChatRoom() {

    // Form Register
    const [register, setRegister] = useState(false);
    const handleRegister = () => {
        setRegister(true);
        setFormLogin(false);
        setFormChat(false);
        setUsername('');
        setPassword('');
        setErrMessage('');
    }

   // Form Login
   const [id, setId] = useState();
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [isShowPassword, setIsShowPassword] = useState(false);
   const [errMessage, setErrMessage] = useState('');

   const socketRef = useRef();

   function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = ''; expires='' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '')  + expires + '; path=/';
    }

    function deleteCookie(name) {   
        document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

   useEffect( () => {

        socketRef.current = socketIOClient.connect(host);

        socketRef.current.on('getId', data => {
            setId(data)
        })

        socketRef.current.on('server-send-register-success', data => {
            setErrMessage('Đăng ký thành công ! Vui lòng chờ...');
            setUsername('');
            setPassword('');
            setTimeout(() => {
                setFormLogin(false);
                setRegister(false);
                setFormChat(true);
                setUser(data.username)
                setCookie(`token`, data.token);
            }, 1000);
        })

        socketRef.current.on('server-send-register-failed', () => {
            setErrMessage('Tên người dùng đã được sử dụng!')
        })

        socketRef.current.on('server-send-login-success', data => {
            setErrMessage('Đăng nhập thành công ! Vui lòng chờ...');
            setUsername('');
            setPassword('');
            setTimeout(() => {
                setFormLogin(false);
                setRegister(false);
                setFormChat(true);
                setUser(data.username);
                setCookie(`token`, data.token);
            }, 1000);
        })

        socketRef.current.on('server-send-login-failed', () => {
            setErrMessage('Thông tin tài khoản hoặc mật khẩu không chính xác!')
        })

        return () => {
            socketRef.current.disconnect();
        };
   }, [])

    const handleEventShowHidePassword = () => {
        setIsShowPassword(!isShowPassword);
    }

    const handleClickRegister = () => {
        setErrMessage('');

        if(username && password) {

            socketRef.current.emit('client-send-register', {
                username,
                password
            });

        }
        else {
            setErrMessage('Vui lòng điền đầy đủ thông tin!')
        }
    }

    const handleClickLogin = async () => {
        setErrMessage('');

        if(username && password) {

            socketRef.current.emit('client-send-login', {
                username: username,
                password: password
            });

        }
        else {
            setErrMessage('Vui lòng điền đầy đủ thông tin!')
        }
    }

    const handleEventKeyDown = (e) => {
        if(e.key === 'Enter' || e.keyCode === 13) {
            if(formLogin) {
                handleClickLogin();
            }
            else if(register) {
                handleClickRegister();
            }
        }
    }

    
    // Form ChatRoom
    const [formLogin, setFormLogin] = useState(true);
    const [formChat, setFormChat] = useState(false);
    const [user, setUser] = useState('');
    let [listUser, setListUser] = useState([]);
    const [value, setValue] = useState('');
    const [listMessage, setListMessage] = useState([]);
    const [typing, setTyping] = useState('');
    const [searchUser, setSearchUser] = useState('');

    const listMessageRef = useRef();

    useEffect(() => {

        socketRef.current.on('server-send-list-user', (data) => {
            setListUser(data);
        })

        socketRef.current.on('server-send-value', data => {
            setListMessage((oldMessage) => {
                return [...oldMessage, data]
            })
        })

        socketRef.current.on('server-send-user-typing', data => {
            setTyping(data);
        })

        socketRef.current.on('server-send-user-stop-typing', () => {
            setTyping('')
        })

        window.addEventListener('unload', () => {
            socketRef.current.emit('logout');
            socketRef.current.disconnect();
            deleteCookie(`token`);

            socketRef.current.on('server-send-user-stop-typing', () => {
                setTyping('')
            })

            setTimeout(() => {
                setFormChat(false);
                setFormLogin(true);
            }, 1000);
            })

        return () => {
            socketRef.current.disconnect();
        };
        }, [])

    const handleClickLogout = () => {
        deleteCookie(`token`);
        socketRef.current.emit('logout');
        socketRef.current.disconnect();

        socketRef.current.on('server-send-user-stop-typing', () => {
            setTyping('')
        })

        setTimeout(() => {
            setFormChat(false);
            setFormLogin(true);
            setErrMessage('');

            window.location.reload();

        }, 1000);

    }

    const handleSend = () => {
        if(value) {
            socketRef.current.emit('user-send-value', value);
            setValue('');
        }

        setTimeout(function() {
            listMessageRef.current.scrollTop = listMessageRef.current.scrollHeight;
        }, 50);
    }

    const handleFocus = () => {
        socketRef.current.emit('user-typing', user) 
    }

    const handleBlur = () => {
        socketRef.current.emit('user-stop-typing')
    }

    const handleKeyDown = (e) => {
        if(e.key === 'Enter') {
            if(value) {
                socketRef.current.emit('user-send-value', value);
                setValue('');
            }

            setTimeout(function() {
                listMessageRef.current.scrollTop = listMessageRef.current.scrollHeight;
            }, 50);
        }
    }

    function filterUsers(value) {
        return listUser.filter(user => user.username.toLowerCase().includes(value.toLowerCase()));
        // alert("Young ._. Boy");
    }

    const handleSearchUser = (e) => {
        setSearchUser(e.target.value);
    }

    return (
        <>
            {
                formLogin &&
                <div className='login-background'>
                <div className='login-container'>
                    <div className='login-content row'>
                        <div className='col-12 text-center login-text'>Đăng nhập</div>
                        
                        <div className='col-12 form-group login-input'>
                            <label htmlFor='username'>Tên tài khoản</label>
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
                            <label htmlFor='password'>Mật khẩu</label>
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
                                    Đăng nhập
                            </button>
                        </div>

                        <div className='col-12'>
                            <span className='forgot-password'>Bạn đã quên mật khẩu?</span>
                        </div>

                        <div className='col-12 text-center mt-3'>
                            <span className='other-login'>Hoặc bạn có thể đăng nhập bằng:</span>
                        </div>

                        <div className='col-12 login-social'>
                            <i className="fab fa-facebook-f facebook"></i>
                            <i className="fab fa-google google"></i>
                        </div>

                        <div className='form-register my-3'>Bạn chưa có tài khoản? <span className='register-user' onClick={handleRegister}> Đăng ký ngay</span></div>
                    </div>
                </div>
                </div>
                
            }

            {
                register && 
                <div className='login-background'>
                <div className='login-container'>
                    <div className='login-content row'>
                        <div className='col-12 text-center login-text'>Đăng ký</div>
                        
                        <div className='col-12 form-group login-input'>
                            <label htmlFor='username'>Tên tài khoản</label>
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
                            <label htmlFor='password'>Mật khẩu</label>
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
                                onClick={(e) => handleClickRegister(e)}
                                >
                                    Đăng ký
                            </button>
                        </div>

                    </div>
                </div>
                </div>
            }

            {
                formChat && 
                <div className="chat-container">
                    <div className='container'>
                        <div className="left">
                            <div className='title-chatroom'>Phòng Chat</div>
                            <div className='search-user'>
                                <i className="fa-solid fa-magnifying-glass"></i>
                                <input 
                                    placeholder='Tìm kiếm'
                                    value={searchUser}
                                    onChange={(e) => handleSearchUser(e)} 
                                />
                            </div>
                            <div className='btn-choose'>
                                <button className='mail-box'>Hộp thư</button>
                                <button className='community active'>Cộng đồng</button>
                            </div>
                            <div className="users-online">Những người đang online</div>
                            <div className="list-user-online">
                                {
                                    filterUsers(searchUser) && filterUsers(searchUser).length > 0 ? filterUsers(searchUser).map((item, index) => {
                                        return (
                                            <div key={index} className='user-online'>{item.username === user ? `${item.username} ( Tôi )` : `${item.username}`}</div>
                                        )
                                    }) : <div className='not-found'>Không tìm thấy người này trong phòng Chat.</div>
                                }
                            </div>
                        </div>
                        <div className="right">
                            <div className='user-typing'>{typing ? `${typing}...` : ''}</div>
                            
                            <div className="welcom">Xin chào, <span className="current-user">{user}</span>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={handleClickLogout}
                                >Thoát khỏi đây</button>
                            </div>

                            <div className="list-message my-3" ref={listMessageRef}>
                                {
                                    listMessage && listMessage.length > 0 &&
                                    listMessage.map((item, index) => {
                                        return (
                                            <div key={index} className={item.id === id ? `your-message` : `other-message`}>
                                                <span className={'username-chat'}>
                                                    {item.id === id ? 'Tôi: ' : `${item.username}: `} 
                                                </span>
                                                <br></br>
                                                <div>{item.content}</div>
                                            </div>
                                        )
                                    })
                                }
                            </div>

                            <div className="input-group">
                                <input 
                                    className="form-control"
                                    type="text"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    onKeyPress={(e) => handleKeyDown(e)}
                                />
                                <button 
                                    type="button" 
                                    className="btn btn-warning"
                                    onClick={handleSend}
                                    style={{minWidth: '100px'}}
                                >Gửi</button>
                            </div>
                        </div>
                    </div>
                </div>
            }

        </>
    )
}

export default ChatRoom;