import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/';

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../../treefy-fe/dist'))); // Express 서버가 정적 파일들을 제공하도록 설정하는 코드
app.use(express.json());
app.use(express.urlencoded({extended:true}));
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
    const postsInsertQuery = 'INSERT INTO posts (title, content, created_date) VALUES (?, ?, DATE(NOW()))';
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
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/list', (req: Request, res: Response) => {
  try {
    let page: number;
    if (typeof req.query.page === 'string') {
      page = parseInt(req.query.page, 10);
    } else {
      page = 0;
    }
    let limit: number;
    if (typeof req.query.limit === 'string') {
      limit = parseInt(req.query.limit, 10);
    } else {
      limit = 5;
    }
    let offset: number = page * limit;
    console.log(limit);
    console.log(offset);
    connection.query('SELECT * FROM posts LIMIT ? OFFSET ?', [limit, offset], (error, results, _fields) => {
      if (error) {
        console.error('Error executing query: ' + error.stack);
        res.status(500).send('Internal Server Error');
        return;
      }
      console.log('전체 글 데이터 : ', results);
      res.send(results);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/list/count', (_req: Request, res: Response) => {
  try {
    connection.query('SELECT COUNT(*) as totalPostsCount FROM posts', (error, results: [{ totalPostsCount : number }], _fields) => {
      if (error) {
        console.error('Error executing query: ' + error.stack);
        res.status(500).send('Internal Server Error');
        return;
      }
      console.log('전체 글 갯수 : ', results[0].totalPostsCount);
      res.send(results[0].totalPostsCount.toString());
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/list/detail/:id', (req: Request, res: Response) => {
  console.log(req.params.id);
  try {
    connection.query('SELECT * FROM posts WHERE id = ?', [req.params.id], (error, results, _fields) => {
      if (error) {
        console.error('Error executing query: ' + error.stack);
        res.status(500).send('Internal Server Error');
        return;
      }
      console.log('세부 글 데이터 : ', results);
      res.send(results);
    })
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/edit/:id', (req: Request, res: Response) => {
  console.log(req.params.id);
  try {
    connection.query('SELECT * FROM posts WHERE id = ?', [req.params.id], (error, results, _fields) => {
      if (error) {
        console.error('Error executing query: ' + error.stack);
        res.status(500).send('Internal Server Error');
        return;
      }
      console.log('세부 글 데이터 : ', results);
      res.send(results);
    })
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/edit/:id', (req: Request, res: Response) => {
  try {
    connection.query('UPDATE posts SET title = ?, content = ? WHERE id = ?', [req.body.title, req.body.content, req.params.id], (error, results, _fields) => {
      if (error) {
        console.error('Error executing query: ' + error.stack);
        res.status(500).send('Internal Server Error');
        return;
      }
      console.log('수정한 글 데이터 : ', results);
      res.send(results);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/delete/:id', (req: Request, res: Response) => {
  try {
    connection.query('DELETE FROM posts WHERE id = ?', [req.params.id], (error, results, _fields) => {
      if (error) {
        console.error('Error executing query: ' + error.stack);
        res.status(500).send('Internal Server Error');
        return;
      }
      console.log('삭제한 글 데이터 : ', results);
      res.send(results);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/signup', (req: Request, res: Response) => {
  try {
    const userInsertQuery = 'INSERT INTO user (username, password, nickname) VALUES (?, ?, ?)';
    connection.query(userInsertQuery, [req.body.username, req.body.password, req.body.nickname], (error, results, _fields) => {
      if (error) {
        console.error('Error executing query: ' + error.stack);
        res.status(500).send('Internal Server Error');
        return;
      }
      console.log('회원가입 결과 데이터 : ', results);
      res.send(results);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});