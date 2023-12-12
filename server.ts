import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../../treefy-fe/dist'))); // Express 서버가 정적 파일들을 제공하도록 설정하는 코드
app.use(express.json());
app.use(express.urlencoded({extended:true}));
dotenv.config();

interface TotalPostsCount extends RowDataPacket {
  totalPostsCount: number
}

interface UserInfo extends RowDataPacket {
  username: string;
  password: string;
  nickname: string;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// 연결 풀을 사용하여 데이터베이스에 연결하려는 시도를 한다
pool.getConnection()
.then(connection => {
    // 연결 성공 시 로그를 출력하고 연결을 풀에 반환한다
    console.log('connected DB');
    connection.release();
    app.listen(process.env.PORT, () => {
      console.log('connected server');
    });
  })
  .catch(err => {
    // 연결 실패 시 에러를 출력한다
    console.error('disconnected DB :' + err.stack);
    return;
});

app.use(passport.initialize());
app.use(session({
  secret: '암호화에 쓸 비번',
  resave : false, // 유저가 서버로 요청할 때마다 세션 갱신할건지 (false가 일반적)
  saveUninitialized : false // 로그인 안해도 세션 만들것인지 (false가 일반적)
}))

app.use(passport.session());

passport.use(new LocalStrategy(async (username: string, password: string, done) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query<UserInfo[]>('SELECT * FROM treefy.`user` WHERE username = ?', [username]);
    if (!results.length) {
      return done(null, false, { message: '아이디 DB에 없음' })
    }
    if (results[0].password === password) {
      return done(null, results[0]);
    } else {
      return done(null, false, { message: '비번불일치' });
    }
  } catch (error) {
    console.log(error);
    done(new Error('Internal Server Error'));
  }
}));

app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../treefy-fe/dist/index.html'));
});

app.post('/posts', async (req: Request, res: Response) => {
  try {
    console.log("POST request received");
    console.log(req.body);
    const postsInsertQuery = 'INSERT INTO posts (title, content, created_date) VALUES (?, ?, DATE(NOW()))';
    // pool에서 연결 시도
    const connection = await pool.getConnection();
    // 쿼리 실행
    await connection.query(postsInsertQuery, [req.body.title, req.body.content]);
    // 데이터베이스 연결 풀에 연결을 반환하는 메서드
    connection.release();

    console.log('Data added to database');
    res.status(201).send(req.body);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/list', async (req: Request, res: Response) => {
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
    const connection = await pool.getConnection();
    const [results] = await connection.query('SELECT * FROM posts LIMIT ? OFFSET ?', [limit, offset]);
    connection.release();
    console.log('전체 글 데이터 : ', results);
    res.send(results);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/list/count', async (_req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query<TotalPostsCount[]>('SELECT COUNT(*) as totalPostsCount FROM posts');
    connection.release();
    console.log('전체 글 갯수 : ', results[0].totalPostsCount);
    res.send(results[0].totalPostsCount.toString());
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/list/detail/:id', async (req: Request, res: Response) => {
  console.log(req.params.id);
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    console.log('세부 글 데이터 : ', results);
    res.send(results);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/edit/:id', async (req: Request, res: Response) => {
  console.log(req.params.id);
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    console.log('세부 글 데이터 : ', results);
    res.send(results);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/edit/:id', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query('UPDATE posts SET title = ?, content = ? WHERE id = ?', [req.body.title, req.body.content, req.params.id]);
    console.log('수정한 글 데이터 : ', results);
    res.send(results);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/delete/:id', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    console.log('삭제한 글 데이터 : ', results);
    res.send(results);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/signup', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const userInsertQuery = 'INSERT INTO user (username, password, nickname) VALUES (?, ?, ?)';
    const [results] = await connection.query(userInsertQuery, [req.body.username, req.body.password, req.body.nickname]);
    console.log('회원가입 결과 데이터 : ', results);
    res.send(results);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/login', async (req: Request, res: Response, next) => {
  console.log(req.body);
  passport.authenticate('local', (error: Error | null, user: UserInfo | false, info: { [key: string]: string }) => {
  try {
      if (error) return res.status(500).json(error);
      if (!user) return res.status(401).json(info && info.message ? info.message : '로그인 실패');
      return req.logIn(user, (error) => {
        if (error) {
          res.status(500).send('로그인 중 에러 발생');
          return next(error);
        }
        return res.send('로그인 성공');
      });
    } catch (error) {
      console.log(error);
      res.status(500).send('Internal Server Error');
    }
  })(req, res, next);
});