import mysql from "mysql";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Asd1212!@",
  database: "real_time_quiz",
  multipleStatements: true,
});

db.connect((err) => {
  if (err) throw err;
  else console.log("MySql connected...");
});

export default db;
