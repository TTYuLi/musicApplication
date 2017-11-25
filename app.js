'use strict'
const config = require('./config')
// 1 引入exress对象
const express = require('express')
// 2 建立服务器
let app = express()
// 3 开启服务器监听端口
app.listen(config.web_port, config.web_host, () => {
  console.log('音乐服务器在9999端口开启了')
})


//引入引擎模板
app.engine('html', require('express-art-template'))
// 引入处理post请求体对象
const bodyParser = require('body-parser')
// 引入session
const session = require('express-session')
// 引入用户登陆页面路由文件
const user_router = require('./user_router')
// 引入音乐管理路由文件
const music_router = require('./music_router')
// 引入总的网页路由目录
const api_router = require('./web_router')


//中间件配置 行为列表
//第-1件是:在路由使用session之前，先生产session
app.use(session({
  secret: 'itcast', //唯一标识，必填
  resave: false,
  //true强制保存,不管有没有改动session中的数据，依然重新覆盖一次
  saveUninitialized: true,//一访问服务器就分配session
  //如果为false,当你用代码显式操作session的时候才分配
  // cookie: { secure: true // 仅仅在https下使用 }
}));

//配置编码格式
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
//在路由中间件执行之前必经之路(url中包含music)
app.use(/\/music|\/api\/.*Music/, (req, res, next) => {
  //判断是否存在session上的user
  if (!req.session.user) {
    return res.send(`
                 请去首页登录
                 <a href="/user/login">点击</a>
            `);
  }
  //比如当前请求是 /music/add-music
  next();
});
//路由数据接口
app.use('/api', api_router)
// 用户页面路由
app.use('/user', user_router)
// 音乐页面路由
app.use('/music', music_router)



// 错误处理中间件
app.use((err, req, res, next) => {
  console.log(err)
  res.send(`
    <div style="background-color:deeppink">
    您要访问的页面飞走了 *_* <a href="/">返回首页？</a>
    </div>
    `)
})