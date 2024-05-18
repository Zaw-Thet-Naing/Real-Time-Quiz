import express from "express";
import path from "path";
import db from "../database/db.js";

export default function (io, poll_status) {
  const app = express();
  const router = express.Router();

  app.use(checkCookie);

  function checkCookie(req, res, next) {
    if (req.cookies["user"]) next();
    else {
      req.session.redirectTo = req.originalUrl;
      res.redirect("/login");
    }
  }

  io.on("connection", (socket) => {
    socket.on("poll_started", (url, id) => {
      poll_status[url] = id;
      io.emit("poll_started", url);
    });

    socket.on("poll_ended", (url) => {
      poll_status[url] = null;
      io.sockets.emit("poll_ended", url);
    });
  });

  router.get(["/", "/history"], checkCookie, (req, res) => {
    let sql = `SELECT poll.id, question, 
              DATE_FORMAT(created_date, '%Y-%m-%d %h:%i %p') as created_date, answer, 
              (SELECT COUNT(*) FROM user_participate_poll
               WHERE user_participate_poll.poll_id = poll.id) AS total_participants
                FROM poll
                JOIN answer ON answer.poll_id = poll.id
                WHERE poll.presenter_id = ? AND is_answer = 1`;
    db.query(sql, [req.cookies["user"].id], (err, result) => {
      if (err) throw err;
      res.render(path.resolve("views", "presenter/history"), {
        rows: result,
        url: req.cookies["user"].url,
      });
    });
  });

  router.get("/activity", checkCookie, (req, res) => {
    res.render(path.resolve("views", "presenter/activity"), {
      id: poll_status[req.cookies["user"].url],
      url: req.cookies["user"].url,
    });
  });

  router.get("/check_poll_status/", checkCookie, (req, res) => {
    res.json(poll_status);
  });

  router.get("/history/:id", checkCookie, (req, res) => {
    let sql = `SELECT poll.id AS poll_id, poll.question,
                answer.id AS answer_id, answer.answer AS answer, is_answer,
                COUNT(participate.participant_id) AS answered_participants
              FROM user_participate_poll participate
              RIGHT JOIN answer ON participate.answer_id = answer.id
              JOIN poll ON poll.id = answer.poll_id
              WHERE answer.poll_id = ?
              GROUP BY answer.id
              HAVING COUNT(participate.participant_id) >= 0;`;
    db.query(sql, [req.params.id], (err, result) => {
      if (err) throw err;
      let total_participants = 0;
      result.forEach((row) => {
        total_participants += row.answered_participants;
      });
      res.json({ rows: result, total_participants: total_participants });
    });
  });

  router.post("/history/:id", [checkCookie], (req, res) => {
    let insert_values = [],
      sql;
    if (req.body.question && req.body.is_answer) {
      insert_values.push(
        req.body.question,
        req.params.id,
        req.params.id,
        req.params.id
      );
      insert_values.push(
        req.body.answers
          .filter((answer) => answer !== "")
          .map((answer) => [
            null,
            req.params.id,
            answer,
            answer == req.body.is_answer ? 1 : 0,
          ])
      );

      sql = `UPDATE poll
              SET question = ?, created_date = DEFAULT
              WHERE id = ?;

              DELETE FROM user_participate_poll WHERE poll_id = ?;

              DELETE FROM answer WHERE poll_id = ?;

              INSERT INTO answer VALUES ?;`;
    } else {
      insert_values.push(req.params.id);
      let buffer = [];
      for (const answer in req.body.answers) {
        Object.keys(req.body.answers[answer]).forEach((participant) => {
          buffer.push([participant, req.body.poll_id, answer]);
        });
      }
      insert_values.push(buffer);
      sql = `DELETE FROM user_participate_poll WHERE poll_id = ?;
                INSERT INTO user_participate_poll VALUES ?`;
    }
    db.query(sql, insert_values, (err, result) => {
      if (err) throw err;
      res.redirect("/presenter/activity");
    });
  });

  router.post(["/", "/history"], (req, res) => {
    let sql = `INSERT INTO poll VALUES (DEFAULT, ?, ?, DEFAULT);
              SELECT MAX(id) AS inserted_id FROM poll WHERE presenter_id = ?;`;

    db.query(
      sql,
      [req.cookies["user"].id, req.body.question, req.cookies["user"].id],
      (err, result) => {
        if (err) throw err;
        let insert_values = req.body.answers
          .filter((answer) => answer !== "")
          .map((answer) => [
            null,
            result[1][0].inserted_id,
            answer,
            answer == req.body.is_answer ? 1 : 0,
          ]);
        sql = `INSERT INTO answer VALUES ?;`;
        db.query(sql, [insert_values], (err, result) => {
          if (err) throw err;
          res.redirect("/presenter/history");
        });
      }
    );
  });

  router.delete("/history/:id", (req, res) => {
    let sql = `DELETE FROM user_participate_poll WHERE poll_id = ?;

              DELETE FROM answer WHERE poll_id = ?;

              DELETE FROM poll WHERE id = ?;`;
    db.query(
      sql,
      [req.params.id, req.params.id, req.params.id],
      (err, result) => {
        if (err) throw err;
        res.json("succeeded");
      }
    );
  });
  return router;
}
