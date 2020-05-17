const express = require('express');
const router = express.Router();
const { pool } =require('../modules/mysql-conn');
const moment = require('moment');
const { alert } = require('../modules/utils');

router.get(['', '/list'], async(req, res, next)=>{
  let pugVals = {cssFile : 'board', jsFile : 'board'};
  let sql = 'SELECT * FROM board ORDER BY id DESC';
  let connect, result;
  try{
    connect = await pool.getConnection();
    result = await connect.query(sql);
    connect.release();
    result[0].forEach((v)=>{
      v.created = moment(v.created).format('YYYY-MM-DD');
    });

    // res.json(result[0]); // 확인용
    pugVals.lists = result[0];
    res.render('board/list', pugVals);
  }
  catch(e){
    connect.release();
    next(e);
  }
})
router.get('/write', (req, res, next)=>{
  const pugVals = {cssFile : 'board', jsFile : 'board'};
  res.render('board/write', pugVals);
})
router.post('/save', async(req, res, next)=>{
  let {title, writer, comment, created=moment().format('YYYY-MM-DD HH:mm:ss')} = req.body;
  // const sql = 'INSERT INTO board SET title=?, writer=?, comment=?, created=now()'
  let sql = 'INSERT INTO board SET title=?, writer=?, comment=?, created=?'
  let values = [title, writer, comment, created];
  let connect , result;
  try{
    connect = await pool.getConnection();
    result = await connect.execute(sql, values);
    connect.release();
    // res.json(result);
    if(result[0].affectedRows > 0) res.send(alert('저장되었습니다.', '/board')); // response redirect 대신 util로 location.href 처리
    else res.send(alert('에러가 발생하였습니다.', '/board'));
  }
  catch(e){
    connect.release();
    console.log(e);
    next(e); // errorcode 전송
  }
})
module.exports = router;