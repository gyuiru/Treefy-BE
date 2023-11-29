const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
var cors = require('cors');
app.use(cors());
require('dotenv').config();

const mysql = require('mysql2');

const connection = mysql.createConnection({
host : process.env.DB_HOST,  
user : process.env.DB_USER,
password : process.env.DB_PASSWORD,
database : process.env.DB_NAME,
});

connection.connect(function(err) {
  if (err) {
    console.error('disconnected DB :' + err.stack);
    return;
  }
  console.log('connected DB');
  app.listen(process.env.PORT, () => {
    console.log('connected server')
  })
});

app.use(express.static(path.join(__dirname, '../treefy-fe/dist/index.html')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../treefy-fe/dist/index.html'));
});

// app.get('/', (req, res) => {
//   res.send('home');
// });