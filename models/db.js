const config = require('../config')
// 引入数据库对象
const mysql = require('mysql')
const pool = mysql.createPool({
  connectionLimit: config.db_connectionLimit,
  host: config.db_host,
  user: config.db_user,
  password: config.db_password,
  database: config.db_database
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