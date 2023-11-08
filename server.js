const express = require('express');
const app = express();

const { MongoClient } = require('mongodb');

let db
const url = 'mongodb+srv://gyuiru:reol81776@cluster0.rqprmfn.mongodb.net/?retryWrites=true&w=majority'
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공');
  db = client.db('treefy');
  app.listen(3000, () => {
    console.log('http://localhost:3000 에서 서버 실행중');
  });
}).catch((err)=>{
  console.log(err);
});

app.get('/', (req, res) => {
  res.send('home');
});