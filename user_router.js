'use strict'
const express = require('express')
const userController = require('./controllers/userController')
//配置路由规则
let router = express.Router()
//登陆注册
router.get('/login', userController.login)
.get('/register',userController.register)

//导出模块
module.exports = router
