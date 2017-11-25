'use strict'
//引入数据库操作db对象
const db = require('../models/db')

// let userController = { }

/**
 * 测试
 * @param {请求体参数} req 
 * @param {响应参数} res 
 * @param {function下一步
 * } next 
 * 
 */
exports.test = (req, res, next) => {
  db.q('select * from users', [], (err, data) => {
    if (err) return next(err)
    res.render('test.html', { text: data[0].username })
  })
}
/**
 * 检查用户名是否存在
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.check = (req, res, next) => {
  let username = req.body.username
  db.q('select * from users where username =?', [username], (err, results) => {
    if (err) return next(err)
    // console.log(results)
    if (results.length == 0) {
      res.json({
        code: '001',
        msg: '可以注册哦'
      })
    } else {
      res.json({
        code: '002',
        msg: '该用户名已存在，换个试试？'
      })
    }
  })
}
/**
 * 注册
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.register = (req, res, next) => {
  // 1 接收数据
  let user = req.body
  let username = user.username
  let password = user.password
  let v_code = user.v_code
  let email = user.email
  //2 验证邮箱 是否合法
  let regx = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/
  if (!regx.test(email)) {
    res.json({
      code: '004',
      msg: '邮箱名不正确'
    })
    return
  }
  // 验证邮箱名和用户名是否存在
  db.q('select * from users where username = ? or email = ?', [username, email], (err, result) => {
    if (err) return next(err)
    if (result.length != 0) {
      let user = result[0]
      if (user.email == email) {
        return res.json({
          code: '002',
          msg: '该邮箱已被注册'
        })
      } else if (user.username == username) {
        return res.json({
          code: '002',
          msg: '该用户已经被注册'
        })
      }
    } else {
      //用户名和邮箱都不存在， 可以注册
      db.q('insert into users(username,password,email) values (?,?,?)', [username, password, email], (err, result) => {
        if (err) return next(err)
        console.log(result)
        //响应数据
        res.json({
          code: '001', msg: '注册成功'
        })
      })
    }
  })

}
/**
 * 登陆
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.login = (req, res, next) => {

  //接收请求参数
  let username = req.body.username
  let password = req.body.password
  let rememberme = req.body.rememberme
  //将用户名作为查询条件
  db.q('select * from users where username = ?', [username], (err, result) => {
    if (err) return next(err)
    // console.log(result)
    if (result.length == 0) {
      res.json({
        code: '002',
        msg: '用户名或密码输入不正确！'
      })
    } else if (result[0].password != password) {
      return res.json({
        code: '002',
        msg: '用户名或密码输入不正确！'
      })
    } else {
      //登陆成功
      // 使用session存储用户数据
      req.session.user = result[0]
      res.json({
        code: '001',
        msg: '登陆成功'
      })
    }
  })
}
/**
 * 退出
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.logout = (req, res, next) => {
    req.session.user = null
    res.json({
      code: '001',
      msg:'退出成功'
    })
}

//向外导出
// module.exports = userController;