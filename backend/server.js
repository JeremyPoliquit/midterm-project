const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const crudRoutes= require('./routes/crud')

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Tetsuyavirtus123.',
  database: 'student_management',
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

app.use('/api/student', crudRoutes(db)); // student crud
app.use('/api/auth', authRoutes(db)); // register/login


app.listen(5000, () => console.log('Backend running on port 5000'));
