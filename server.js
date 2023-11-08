const express = require('express');
const app = express();

app.listen(3000, () => {
    console.log('http://localhost:3000 에서 서버 실행중');
})

app.get('/', (req, res) => {
  res.send('home');
});