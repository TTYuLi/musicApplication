'use strict'
const express = require('express')
const userController = require('./controllers/userController')
const musicController = require('./controllers/musicController')
//处理请求
// 配置路由规则
let router = express.Router()
router.get('/test', userController.test)//测试
  .post('check-user', userController.check)//检查用户名
  .post('/register', userController.register)//注册
  .post('/login', userController.login)//登陆验证
  .get('/logout', userController.logout)//退出登录
  .post('/addMusic', musicController.addMusic)//添加音乐
  .put('/updateMusic', musicController.updateMusic)//修改音乐
  .delete('/delMusic', musicController.delMusic)//删除音乐

// 配置路由规则结束，导出路由
module.exports = router