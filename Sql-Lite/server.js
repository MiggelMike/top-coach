// Zum Testen in das Verzeichnis der Datei wechseln!
//  const express = require('express')
// const path = require('path')
// const bodyParser = require('body-parser')
// const cors = require('cors')
// const Mysqlite3 = require('sqlite3').verbose();
// var MyDB = new Mysqlite3.Database('TopCoach.DB');

// db.serialize(function () {
//   //  db.run('CREATE TABLE lorem (info TEXT)')

//   // var stmt = db.prepare('update lorem set info = "XX" ')
//   // stmt.run()
//   // // for (var i = 0; i < 10; i++) {
//   // //   stmt.run('Ipsum ' + i)
//   // // }
//   // stmt.finalize(() => {
//   //   var e = '';
//   //   e = 'cc';
//   // })

//   var stmt = db.prepare('insert into Sportler (Name) values("aaaa7yy")');
//   stmt.run();
//   stmt.finalize();

//   // db.each('SELECT rowid AS id, info FROM lorem', function (_err, row) {
//   //   console.log(row.id + ': ' + row.info)
//   // })
// })

// MyDB.run(`CREATE TABLE IF NOT EXISTS 
//         Sportler  ( ID	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
//                     Name	TEXT NOT NULL,
//                     Geburtstag	TEXT )`
// )

// for (let index = 0; index < 5; index++) {
//   var stmt = db.prepare('insert into Sportler (Name) values(' + '"b- ' + index.toString() + '" )');
//   stmt.run();
//   stmt.finalize();
// }


// MyDB.close();

// const app = express();
// let port = process.env.PORT || 4000;

// const server = app.listen(function () {
//   console.log('Listening on port ' + port);
// });
