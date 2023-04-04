import User from "../models/User";
import userService from "../service/userService";

let getTestData = (req, res) => {
    User.find({})
    .then(users => {
        return res.status(200).json(users);
    })
    .catch(err => console.log(err))

}

let createUser = async (req, res) => {
    try {
        let data = await userService.createUser(req.body);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error From Server...'
        })
    }
}

let handleEventLogin = async (req, res) => {
    try {
        let data = await userService.handleEventLogin(req.body);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error From Server...'
        })
    }
}

export default {
    getTestData,
    handleEventLogin,
    createUser,
};