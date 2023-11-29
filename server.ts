import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2';

const app = express();
app.use(express.json());
app.use(cors());
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
  res.sendFile(path.join(__dirname, '../treefy-fe/dist/index.html'));
});