import express from "express";
import path from "path";
import db from "../database/db.js";

export default function (io, poll_status) {
  const app = express();
  const router = express.Router();

  // buffer that track each participant activity in different polls
  let participant_activity = {};

  app.use(checkCookie);

  function checkCookie(req, res, next) {
    if (req.cookies["user"]) next();
    else {
      req.session.redirectTo = req.originalUrl;
      res.redirect("/login");
    }
  }

  router.get("/participant_activity/", (req, res) => {
    res.json(participant_activity);
  });

  io.on("connection", (socket) => {
    // Listen for user choosing answers and update the participant_activity buffer
    socket.on("chose_answer", (url, answer_id) => {
      if (!participant_activity[url]) {
        participant_activity[url] = {};
      }

      if (!participant_activity[url][answer_id]) {
        participant_activity[url][answer_id] = {};
      }

      participant_activity[url][answer_id][socket.cookies["user"].id] = true;
      io.emit("chose_answer", participant_activity);
    });

    socket.on("poll_started", (url, id) => {
      participant_activity[url] = null;
    });

    socket.on("poll_ended", (url) => {
      participant_activity[url] = {};
    });
  });

  router.get(["/", "/participate"], checkCookie, (req, res) => {
    res.render(path.resolve("views", "participant/participate"), {
      id: req.cookies["user"].id,
      result: null,
      error: null,
    });
  });

  router.get("/participate/:url", checkCookie, (req, res) => {
    if (poll_status.hasOwnProperty(req.params.url)) {
      res.render(path.resolve("views", "participant/participate"), {
        id: req.cookies["user"].id,
        error: null,
      });
    } else {
      res.render(path.resolve("views", "participant/participate"), {
        id: req.cookies["user"].id,
        error: "Poll not found",
      });
    }
  });

  router.get("/get_answers/:url", checkCookie, (req, res) => {
    let sql = `SELECT poll.question, answer.id, answer, is_answer FROM answer 
                JOIN poll ON poll.id = answer.poll_id
                JOIN user ON user.id = poll.presenter_id
                WHERE poll.id = ?`;
    db.query(
      sql,
      [
        poll_status[req.params.url]
          ? poll_status[req.params.url]
          : req.params.url,
      ],
      (err, result) => {
        if (err) throw err;
        res.json(result);
      }
    );
  });

  router.get(
    "/history/",
    (checkCookie,
    (req, res) => {
      let sql = `SELECT poll.id, poll.question, 
                  DATE_FORMAT(poll.created_date, '%Y-%m-%d %h:%i %p') as date,
                  answer.id as chosen_answer_id
                    FROM user_participate_poll
                    JOIN answer ON answer.id = user_participate_poll.answer_id
                    JOIN poll ON user_participate_poll.poll_id = poll.id
                    WHERE participant_id = ?;`;

      db.query(sql, [req.cookies["user"].id], (err, result) => {
        if (err) throw err;
        res.render(path.resolve("views", "participant/history"), { result });
      });
    })
  );

  return router;
}