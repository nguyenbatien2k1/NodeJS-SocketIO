import express from 'express';
import userController from '../controller/userController';

let router = express.Router();

let initWebRoutes = (app) => {
    router.get('/tien', userController.getTestData)

    router.get('/', (req, res) => {
        return res.send('Home Page');
    })

    router.post('/api/login', userController.handleEventLogin)

    router.post('/api/user', userController.createUser)


    return app.use('/', router);
}

export default initWebRoutes;