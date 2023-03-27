import express from 'express';
import configViewEngine from './config/viewEngine.js';

const app = express()
const port = 3000

// config view engine
configViewEngine(app);

app.get('/', (req, res) => {
  res.send('Hello World Tien nha hihi!')
})

app.get('/hi', (req, res) => {
    return res.render('test')
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})