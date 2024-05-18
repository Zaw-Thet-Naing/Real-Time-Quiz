import express from "express";
import path from "path";
import { body, validationResult } from "express-validator";
import db from "../database/db.js";

export default function (poll_status) {
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

  router.get("/", (req, res) => {
    res.sendFile(path.resolve("public", "main_pages/main_page.html"));
  });

  router.get("/login", (req, res) => {
    res.render(path.resolve("views", "form/login"), { errors: [], data: "" });
  });

  router.post(
    "/login",
    [
      body("mail").isEmail().withMessage("Invalid mail address"),
      body("password")
        .isLength({ min: 8, max: 16 })
        .withMessage("Password must be at least 8 characters"),
    ],
    (req, res) => {
      const errors = validationResult(req);
      var rows;
      new Promise((resolve, reject) => {
        let sql =
          "SELECT * FROM user WHERE BINARY mail = ? AND BINARY password = ?";
        db.query(sql, [req.body.mail, req.body.password], (err, result) => {
          if (err) throw err;
          if (result.length < 1) {
            errors.errors.push({
              value: req.body.mail + " / " + req.body.password,
              path: "password",
              msg: "Incorrect mail or password",
            });
          }
          rows = result;
          resolve();
        });
      }).then(() => {
        if (!errors.isEmpty()) {
          res.render(path.resolve("views", "form/login"), {
            errors: errors.array(),
            data: req.body.mail,
          });
        } else {
          res.cookie("user", rows[0], { maxAge: 86400000, httpOnly: true });
          const redirectTo = req.session.redirectTo || "/";
          delete req.session.redirectTo;
          res.redirect(redirectTo);
        }
      });
    }
  );

  router.post(
    "/register",
    [
      body("name").notEmpty().withMessage("This field is required"),
      body("mail").isEmail().withMessage("Invalid mail address"),
      body("password")
        .isLength({ min: 8, max: 16 })
        .withMessage("Password must be at least 8 characters"),
      body("confirm_password").custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("The confirmed password doesn't match");
        }
        return true;
      }),
    ],
    (req, res) => {
      const errors = validationResult(req);
      new Promise((resolve, reject) => {
        let sql = "SELECT * FROM user WHERE BINARY mail = ?";
        db.query(sql, [req.body.mail], (err, result) => {
          if (err) throw err;
          if (result.length > 0) {
            errors.errors.push({
              value: req.body.mail,
              path: "mail",
              msg: "Mail already in used",
            });
          }
          resolve();
        });
      }).then(() => {
        if (!errors.isEmpty()) {
          res.render(path.resolve("views", "form/register"), {
            errors: errors.array(),
            data: req.body,
          });
        } else {
          let url = (req.body.name + (Date.now() % 100000)).replaceAll(" ", "");
          let sql = "INSERT INTO user VALUES (DEFAULT, ?, ?, ?, ?)";
          db.query(
            sql,
            [req.body.name, req.body.mail, req.body.password, url],
            (err, result) => {
              if (err) throw err;
              poll_status[url] = null;
              res.redirect("/login");
            }
          );
        }
      });
    }
  );

  router.get("/register", (req, res) => {
    res.render(path.resolve("views", "form/register"), {
      errors: [],
      data: "",
    });
  });

  router.get("/check_cookie", (req, res) => {
    res.json(req.cookies["user"] ? req.cookies["user"] : null);
  });

  router.get("/profile", checkCookie, (req, res) => {
    res.render(path.resolve("views", "main_pages/profile"), {
      data: req.cookies["user"],
      errors: null,
    });
  });

  router.post(
    "/profile",
    [
      checkCookie,
      body("name").notEmpty().withMessage("This field is required"),
      body("mail").isEmail().withMessage("Invalid mail address"),
    ],
    (req, res) => {
      const errors = validationResult(req);
      new Promise((resolve, reject) => {
        let sql = "SELECT * FROM user WHERE BINARY mail = ? AND id != ?";
        db.query(
          sql,
          [req.body.mail, req.cookies["user"].id],
          (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
              errors.errors.push({
                value: req.body.mail,
                path: "mail",
                msg: "Mail already in used",
              });
            }
            resolve();
          }
        );
      }).then(() => {
        if (!errors.isEmpty()) {
          res.render(path.resolve("views", "main_pages/profile"), {
            data: req.body,
            errors: errors.array(),
          });
        } else {
          let sql = "UPDATE user SET name = ?, mail = ? WHERE id = ?";
          db.query(
            sql,
            [req.body.name, req.body.mail, req.cookies["user"].id],
            (err, result) => {
              if (err) throw err;
              const user_info = {
                id: req.cookies["user"].id,
                name: req.body.name,
                mail: req.body.mail,
              };
              res.cookie("user", user_info);
              res.redirect("/profile");
            }
          );
        }
      });
    }
  );

  router.get("/logout", (req, res) => {
    res.clearCookie("user");
    res.redirect("/login");
  });

  return router;
}