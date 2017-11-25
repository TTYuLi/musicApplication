'use strict'
//引入数据库操作db对象
const db = require('../models/db')

// 引入 解析文件上传的包
const formidable = require('formidable')
// 引入核心对象path
const path = require('path')
//引入配置对象
const config = require('../config')
/**
 * 添加音乐
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.addMusic = (req, res, next) => {
  // console.log(req.session.user)
  if (!req.session.user) {
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
}
/**
 * 更新音乐
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.updateMusic = (req, res, next) => {
  //先判断session中是否存在user
  if (!req.session.user) {
    //没有则先登录
    res.send(`
          请先登录<a href="/login">点这里</a>
        `)
  }

  //解析提交数据
  var form = new formidable.IncomingForm()
  form.uploadDir = path.join(__dirname, 'public/files')
  form.parse(req, (err, fields, files) => {
    if (err) return next(err)
    console.log(fields.id)
    //先取出前三个字段
    let datas = [fields.title, fields.singer, fields.time]
    // 数据库查询语句
    let sqlstr = 'update musics set title =?, singer =?, time =?'
    // 歌曲名获取
    if (files.file) {
      let filename = path.parse(files.file.path).base
      datas.push(`/public/files/${filename}`)
      sqlstr += ',file = ?'
    }
    // 歌词路径名获取
    if (files.filelrc) {
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
    db.q(sqlstr, datas, (err, result) => {
      if (err) return next(err)
      res.json({
        code: '001',
        msg: '更新成功'
      })
    })
  })

}
/**
 * 删除音乐
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.delMusic = (req, res, next) => {
  //获取用户id
  let userid = req.session.user.id
  //接收参数
  let musicId = req.query.id
  //删除数据
  db.q('delete from musics where id = ? and uid = ?', [musicId, userid], (err, result) => {
    if (err) return next(err)
    if (result.affectedRows == 0) {
      return res.json({
        code: '002',
        msg: '歌曲不存在'
      })
    }
    // 删除成功
    res.json({
      code: '001',
      msg: '删除成功'
    })
  })
}