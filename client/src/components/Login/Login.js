import { useEffect, useRef, useState } from 'react';
import userService from '../../services/userService.js';
import socketIOClient from "socket.io-client";
import './Login.scss'

const host = 'http://localhost:8080/'

function Login() {

    const [id, setId] = useState();
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [formLogin, setFormLogin] = useState(true);
    const [formChat, setFormChat] = useState(false);
    const [user, setUser] = useState('');
    const [listUser, setListUser] = useState([]);
    const [value, setValue] = useState('');
    const [listMessage, setListMessage] = useState([]);
    const [typing, setTyping] = useState('');

    const socketRef = useRef();

    useEffect(() => {

        socketRef.current = socketIOClient.connect(host);

        socketRef.current.on('getId', data => {
            setId(data)
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

        return () => {
            socketRef.current.disconnect();
        };
        }, [])

    const handleClickRegister = () => {
        if(username) {

            socketRef.current.emit('client-send-username', username);

            socketRef.current.on('server-send-username-success', data => {
                setMessage('Đăng ký tài khoản thành công!');
                setUsername('');
                setTimeout(() => {
                    setFormLogin(false);
                    setFormChat(true);
                    setUser(data)
                    listUser.push(data);
                }, 1000);
            })

            socketRef.current.on('server-send-username-failed', () => {
                setMessage('Tên người dùng đã tồn tại!');
            })

            socketRef.current.on('server-send-list-user', (data) => {
                setListUser(data)
            })
        }
    }

    const handleClickLogout = () => {
        socketRef.current.emit('logout');
        socketRef.current.disconnect();

        setTimeout(() => {
            setFormChat(false);
            setFormLogin(true);
            setMessage('')
        }, 1000);
    }

    const handleSend = () => {
        if(value) {
            socketRef.current.emit('user-send-value', value);
            setValue('');
        }
    }

    const handleFocus = () => {
        socketRef.current.emit('user-typing', user) 
    }

    const handleBlur = () => {
        socketRef.current.emit('user-stop-typing')
    }

    return (
        <>
            {
                formLogin && 
                <div className="login-container">
                    <div className='container'>
                        <div className="form-group">
                            <label>Nhập tên của bạn</label>
                            <div className="input-group col-4">
                                <input
                                    value={username} 
                                    type="text" 
                                    className="form-control"
                                    onChange={(e) => setUsername(e.target.value)} 
                                />
            
                                <div className="input-group-append">
                                    <button
                                        type="button" 
                                        className="btn btn-primary"
                                        onClick={handleClickRegister}
                                    >Đăng ký</button>
                                </div>
                                
                            </div>
                        </div>
                        <span>{message}</span>
                    </div>
                </div>
            }

            {
                formChat && 
                <div className="chat-container">
                    <div className='container'>
                        <div className="left">
                            <div className="users-online mb-3">Những người đang online</div>
                            <div className="list-user-online">
                                {
                                    listUser && listUser.length > 0 &&
                                    listUser.map((item, index) => {
                                        return (
                                            <div key={index}>{item}</div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <div className="right">
                            <div className="welcom">Xin chào, <span className="current-user">{user}</span>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={handleClickLogout}
                                >Thoát khỏi đây</button>
                            </div>

                            <div className="list-message my-3">
                                {
                                    listMessage && listMessage.length > 0 &&
                                    listMessage.map((item, index) => {
                                        return (
                                            <div key={index} className={item.id === id ? `your-message my-2` : `other-message my-2`}>
                                                {item.username}: {item.content}
                                            </div>
                                        )
                                    })
                                }
                                <div className='user-typing'>{typing}</div>
                            </div>

                            <div className="input-group">
                                <input 
                                    className="form-control"
                                    type="text"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
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

export default Login;