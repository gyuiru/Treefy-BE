const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
var cors = require('cors');
app.use(cors());

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

app.use(express.static(path.join(__dirname, '../treefy-fe/dist/index.html')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../treefy-fe/dist/index.html'));
});

app.get('/', (req, res) => {
  res.send('home');
});