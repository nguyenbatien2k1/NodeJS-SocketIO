import axios from "axios";

const userService = {
    testGetData() {
        return axios.get('/test');
    }
}

export default userService;