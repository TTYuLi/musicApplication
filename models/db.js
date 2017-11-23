// 引入数据库对象
const mysql = require('mysql')
const pool = mysql.createPool({
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: 'ztw526',
  database: 'node_music'
})


let q = function (sql, props, callback) {
  pool.getConnection((err, connection) => {
    if (err) return callback(err, null)
    connection.query(sql, props, (err, results) => {
      connection.release()
      callback(err, results)
    })
  })
}
//导出代码
module.exports = {q:q}