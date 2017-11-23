// 1 引入exress对象
const express = require('express')
// 2 建立服务器
let app = express()
// 3 开启服务器监听端口
app.listen(9999, () => {
  console.log('音乐服务器在9999端口开启了')
})

//引入数据库操作db对象
const db = require('./models/db')
//引入引擎模板
app.engine('html', require('express-art-template'))
// 引入处理post请求体对象
const bodyParser = require('body-parser')
// 引入session
const session = require('express-session')
// 引入 解析文件上传的包
const formidable = require('formidable')
// 引入核心对象path
const path = require('path')
//创建路由器
let router = express.Router()
// 测试
// router.get('/test', (req,res,next)=>{
//   db.q('select * from users',[],(err,data)=>{
//     if (err) return next(err)
//     res.render('test.html', {text:data[0].username})
//   })
// })

// 验证登陆用户名
router.post('/check-user', (req, res, next) => {
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
})
  // 注册验证
  .post('/register', (req, res, next) => {
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

  })
  // 登陆验证
  .post('/login', (req, res, next) => {

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
  })
  //添加音乐
  .post('/addMusic', (req, res, next) => {
    // console.log(req.session.user)
    if (!req.session.user){
      res.send(`
      请去首页登录<a href="/login">点这里</a>
      `)
    }
    var form = new formidable.IncomingForm()
    form.uploadDir = path.join(__dirname, 'public/files')
    form.parse(req, (err, fields, files) => {
      if (err) return next(err)
      //console.log(fields)
      //console.log(files)
      // 1 先获取字段中的前三个
      let datas = [fields.title, fields.singer, fields.time]
      // 查询语句
      sqlstr = 'insert into musics (title,singer,time,'
      params = '(?,?,?'
      // 2 音乐文件路径
      if (files.file) {
        // 获取音乐名
        let filename = path.parse(files.file.path).base
        // 放入数组中
        datas.push(`/public/files/${filename}`)
        sqlstr += 'file,'
        params += ',?'
      }

      //3 歌词路径名
      if (files.filelrc) {
        //获取文件名
        let lrcname = path.parse(files.filelrc.path).base
        // 放入数组中
        datas.push(`/public/files/${lrcname}`)
        sqlstr += 'filelrc,'
        params += ',?'
      }

      sqlstr += 'uid) values'
      params += ',?)'

      //用户id
      datas.push(req.session.user.id)
      //连接数据库，插入音乐数据
      db.q(sqlstr + params, datas, (err, result) => {
        if (err) return next(err)
        // console.log(result)
        res.json({
          code: '002',
          msg: '添加成功'
        })
      })
    })
  })
  //修改音乐
.put('/updateMusic', (req, res, next)=>{
    //先判断session中是否存在user
    if (!req.session.user){
        //没有则先登录
        res.send(`
          请先登录<a href="/login">点这里</a>
        `)
    }

    //解析提交数据
    var form = new formidable.IncomingForm()
    form.uploadDir = path.join(__dirname, 'public/files')
    form.parse(req, (err, fields,files) => {
      if (err) return next(err)
      console.log(fields.id)
      //先取出前三个字段
      let datas = [fields.title,fields.singer,fields.time]
      // 数据库查询语句
      let sqlstr = 'update musics set title =?, singer =?, time =?'
      // 歌曲名获取
      if (files.file) {
        let filename = path.parse(files.file.path).base
        datas.push(`/public/files/${filename}`)
        sqlstr += ',file = ?'
      }
      // 歌词路径名获取
      if(files.filelrc){
        let lrcname = path.parse(files.filelrc.path).base
        datas.push(`/public/files/${lrcname}`)
        sqlstr += ', filelrc = ?'
      }

      //查询条件
      sqlstr += 'where id = ?'
      datas.push(fields.id)
      // console.log(sqlstr)
      // console.log(datas)
      //执行数据库更新操作
      db.q(sqlstr, datas,(err, result)=>{
        if (err) return next(err)
        res.json({
          code:'001',
          msg: '更新成功'
        })
      })
    })

})

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
// 调用路由
app.use(router)
// 错误处理中间件
app.use((err, req, res, next) => {
  console.log(err)
  res.send(`
    <div style="background-color:deeppink">
    您要访问的页面飞走了 *_* <a href="/">返回首页？</a>
    </div>
    `)
})