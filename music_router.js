'use strict'
const express = require('express')
const musicController = require('./controllers/musicController')
//配置路由
let router =express.Router()
router.get('/addMusic', musicController.addMusic)//添加音乐
//.get('MusicList', musicController.MusicList)//显示音乐列表