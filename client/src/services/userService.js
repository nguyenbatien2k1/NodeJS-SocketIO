import axios from "axios";

const userService = {
    testGetData() {
        return axios.get('/tien')
    },

    createUser(data) {
        return axios.post('/api/user', data)
    },

    handleEventLogin(data) {
        return axios.post('/api/login', data)
    }
}

export default userService;