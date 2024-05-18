document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".wrapper");
  const user_id = document.querySelector("#user-id").innerHTML;
  const socket = io("http://localhost:3000/");

  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const urlInput = encodeURIComponent(document.querySelector("#url").value);
      location.pathname = `/participant/participate/${urlInput}`;
    });
  }

  const answers_container = document.querySelector(".answers");
  const waiting_text = document.querySelector(".waiting-text");
  fetch("/presenter/check_poll_status/")
    .then((response) => response.json())
    .then((data) => {
      let end_point =
        location.pathname.split("/")[location.pathname.split("/").length - 1];
      if (data.hasOwnProperty(end_point)) {
        if (!data[end_point]) {
          form.style.display = "none";
          answers_container.style.display = "none";
          waiting_text.style.display = "block";
        } else {
          let end_point =
            location.pathname.split("/")[
              location.pathname.split("/").length - 1
            ];
          createAnswerField(end_point);
        }
      } else {
        form.style.display = "flex";
        waiting_text.style.display = "none";
        answers_container.style.display = "none";
      }
    });

  socket.on("connect", () => {
    let end_point =
      location.pathname.split("/")[location.pathname.split("/").length - 1];
    socket.on("poll_started", (url) => {
      if (url == end_point) {
        createAnswerField(end_point);
      }
    });

    socket.on("poll_ended", (url) => {
      let end_point =
        location.pathname.split("/")[location.pathname.split("/").length - 1];
      if (url == end_point) {
        form.style.display = "none";
        answers_container.style.display = "none";
        waiting_text.style.display = "block";
      }
    });
  });

  function createAnswerField(end_point) {
    form.style.display = "none";
    waiting_text.style.display = "none";
    answers_container.style.display = "flex";
    fetch(`/participant/get_answers/${end_point}`)
      .then((response) => response.json())
      .then((answers) => {
        answers_container.innerHTML = "";
        const question = document.createElement("h1");
        const div = document.createElement("div");
        div.classList.add("answer-container");
        question.innerHTML = answers[0].question;
        question.className = "font-weight-bold";
        answers_container.appendChild(question);
        answers_container.appendChild(div);
        let btn = document.createElement("button");

        btn.classList.add("btn", "btn-secondary", "btn-answer");

        btn.setAttribute("data-toggle", "modal");
        btn.setAttribute("data-target", "#confirm-answer");

        answers.forEach((row, index) => {
          btn.id = row.id;
          btn.innerHTML = row.answer;
          const cloned_btn = btn.cloneNode(true);
          div.appendChild(cloned_btn);
        });

        let answer_btns = document.querySelectorAll(".btn-answer");

        let url =
          location.pathname.split("/")[location.pathname.split("/").length - 1];
        let participant_activity = null;
        fetch("/participant/participant_activity/")
          .then((response) => response.json())
          .then((data) => {
            if (data[url]) {
              participant_activity = data[url];
              Object.values(data[url]).forEach((user) => {
                if (user[user_id]) {
                  answer_btns.forEach((btn, index) => {
                    btn.disabled = true;
                    if (answers[index].is_answer) {
                      btn.classList.replace("btn-secondary", "btn-success");
                    } else if (
                      participant_activity[answers[index].id] !== undefined &&
                      participant_activity[answers[index].id][user_id] !==
                        undefined
                    ) {
                      btn.classList.replace("btn-secondary", "btn-danger");
                    }
                  });
                }
              });
            }
          });

        let chosenAnswerId;

        answer_btns.forEach((btn) => {
          let url =
            location.pathname.split("/")[
              location.pathname.split("/").length - 1
            ];
          btn.addEventListener("click", (e) => {
            chosenAnswerId = btn.id;
          });
        });

        document.querySelector(".btn-confirm").addEventListener("click", () => {
          answer_btns.forEach((answer_btn, index) => {
            answer_btn.disabled = true;
            if (answers[index].is_answer) {
              answer_btn.classList.replace("btn-secondary", "btn-success");
            }

            if (
              answers[index].id == chosenAnswerId &&
              document.getElementById(`${chosenAnswerId}`)
            ) {
              socket.emit("chose_answer", url, chosenAnswerId);
              document
                .getElementById(`${chosenAnswerId}`)
                .classList.replace("btn-secondary", "btn-danger");
            }
          });
        });
      });
  }
});
