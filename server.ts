import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2';

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../../treefy-fe/dist'))); // Express 서버가 정적 파일들을 제공하도록 설정하는 코드
app.use(express.json());
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error('disconnected DB :' + err.stack);
    return;
  }
  console.log('connected DB');
  app.listen(process.env.PORT, () => {
    console.log('connected server');
  });
});

app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../treefy-fe/dist/index.html'));
});

app.post('/posts', (req: Request, res: Response) => {
  try {
    console.log("POST request received");
    console.log(req.body);
    const postsInsertQuery = 'INSERT INTO posts (title, content, created_date) VALUES (?, ?, NOW())';
    connection.query(postsInsertQuery, [req.body.title, req.body.content], (error, _results, _fields) => {
      if (error) {
        console.error('Error executing query: ' + error.stack);
        res.status(500).send('Internal Server Error');
        return;
      }
      console.log('Data added to database');
      res.status(201).send(req.body);
    })
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
