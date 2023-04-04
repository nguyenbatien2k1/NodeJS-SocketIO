import User from "../models/User";
import jwt from 'jsonwebtoken';


let createUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!data.username || !data.password) {
                resolve({
                    errCode: -1,
                    errMessage: 'Missing parameter...'
                })
            }
            else {
                let user = await User.findOne({username: data.username}).exec();
                if(user) {
                    resolve({
                        errCode: 1,
                        errMessage: 'The account already exists on the system :<'
                    })
                }
                else {
                    let newUser = new User(data)
                    newUser.save();
                    resolve({
                        errCode: 0,
                        errMessage: 'Create new user OK!'
                    })
                }
                
            }          
        } catch (error) {
            reject(error)
        }      
    })
}

let handleEventLogin = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!data.username || !data.password) {
                resolve({
                    errCode: -1,
                    errMessage: 'Missing parameter...'
                })
            }
            else {
                let user = await User.findOne({username: data.username}).exec();
                if(user) {
                    let checkPassword = await User.findOne({username: data.username, password: data.password}).exec();
                    if(checkPassword) {
                        try {
                            const token = jwt.sign({username: data.username}, 'tienbasic');
                            resolve({
                                errCode: 0,
                                errMessage: 'Login Successfully!',
                                token: token
                            })
                        } catch (error) {
                            
                        }
                    }
                    else {
                        resolve({
                            errCode: 1,
                            errMessage: 'Thông tin tài khoản hoặc mật khẩu không chính xác!'
                        })
                    }
                }
                else {
                    resolve({
                        errCode: 1,
                        errMessage: 'Thông tin tài khoản hoặc mật khẩu không chính xác!'
                    })
                }
                
            }          
        } catch (error) {
            reject(error)
        }      
    })
}

export default {
    createUser,
    handleEventLogin
}