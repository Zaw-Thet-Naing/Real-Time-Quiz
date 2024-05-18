Chart.register(ChartDataLabels);

document.addEventListener("DOMContentLoaded", (event) => {
  const chart_form = document.querySelector(".chart-form");
  const url = document.querySelector(".text-info").innerHTML;
  const info_container = document.querySelector(".info-container");

  document.querySelector(".cancel-chart-view").addEventListener("click", () => {
    location.pathname = "/presenter/history";
  });

  document.querySelector(".add-activity").addEventListener("click", () => {
    info_container.style.backgroundColor = "grey";
    document.querySelector("form").action = "/presenter/history/";
    chart_form.style.display = "flex";
    setTimeout(() => {
      document.body.style.backgroundColor = "grey";
      chart_form.style.opacity = 1;
    }, 1);
    document.querySelector("input[type='submit']").value = "Add";
  });

  const answers_container = document.querySelector(".answers");
  const answer_inputs_containers = document.querySelectorAll(".answer");

  let already_marked = null;
  document.querySelector(".add-answers").addEventListener("click", () => {
    const answer_input_container = answer_inputs_containers[0].cloneNode(true);
    answer_input_container
      .querySelector(".answer-input")
      .removeAttribute("required");
    answer_input_container.querySelector(".answer-input").value = "";
    answer_input_container
      .querySelector("input[type='radio']")
      .classList.remove("btn-success");
    answer_input_container.querySelector("input[type='radio']").checked = false;
    answer_input_container.querySelector("input[type='radio']").value = "";
    answers_container.appendChild(answer_input_container);
    addRadioListeners();
  });

  document.querySelector(".cancel").addEventListener("click", () => {
    chart_form.style.display = "none";
    document.body.style.backgroundColor = "";
    chart_form.style.opacity = 0;
    info_container.style.backgroundColor = "white";
  });
  document.addEventListener("keydown", (event) => {
    if (event.key == "Escape") {
      chart_form.style.display = "none";
      document.body.style.backgroundColor = "";
      chart_form.style.opacity = 0;
    }
  });

  // function addRadioListeners() {
  //   document.querySelectorAll("input[type='radio']").forEach((radio, index) => {
  //     radio.addEventListener("change", () => {
  //       console.log(radio.value);
  //       if (already_marked !== null) {
  //         document
  //           .querySelectorAll("input[type='radio']")
  //           [already_marked].classList.remove("btn-success");
  //       } else {
  //         document
  //           .querySelectorAll("input[type='radio']")[0]
  //           .classList.remove("btn-success");
  //       }
  //       radio.classList.add("btn-success");
  //       already_marked = index;
  //     });
  //   });
  // }

  function addRadioListeners() {
    document.querySelectorAll("input[type='radio']").forEach((radio, index) => {
      let answer_input_value = document
        .querySelectorAll(".answer")
        [index].querySelector("input[type='text']").value;
      if (answer_input_value == "") radio.disabled = true;
      else radio.disabled = false;
      radio.addEventListener("change", () => {
        radio.value = document.querySelectorAll(".answer-input")[index].value;
        if (already_marked !== null) {
          document
            .querySelectorAll("input[type='radio']")
            [already_marked].classList.remove("btn-success");
        } else {
          document
            .querySelectorAll("input[type='radio']")[0]
            .classList.remove("btn-success");
        }
        radio.classList.add("btn-success");
        already_marked = index;
      });
    });

    const inputFields = document.querySelectorAll(".form-control.answer-input");
    const radioButtons = document.querySelectorAll(".mark-correct-answer");
    inputFields.forEach((inputField, index) => {
      inputField.addEventListener("input", (e) => {
        if (e.target.value.trim() === "") {
          radioButtons[index].disabled = true;
          radioButtons[index].checked = false;
          radioButtons[index].classList.remove("btn-success");
        } else {
          radioButtons[index].disabled = false;
        }
      });
    });
  }

  addRadioListeners();

  const table_rows = document.querySelectorAll("tbody > tr");
  table_rows.forEach((row) => {
    row.addEventListener("click", () => {
      const id = row.children[0].innerHTML;
      const total_participants = row.children[3].innerHTML;

      fetch(`/presenter/history/${id}`)
        .then((response) => {
          if (!response.ok) throw new Error("Network response was not ok");

          return response.json();
        })
        .then((result) => {
          document.querySelector("form").addEventListener("submit", () => {
            const socket = io("http://localhost:3000/");
            socket.on("connect", () => {
              socket.emit("poll_started", url, id);
            });
          });

          document.querySelector(".wrapper-child").style.display = "none";
          document.querySelector(".chart").style.display = "flex";
          document.querySelector(".chart > h2").innerHTML =
            "Total Participants: " + total_participants;

          let canvas = document.querySelector("canvas");
          let answers = [];
          let numbers = [];

          result.rows.forEach((row) => {
            answers.push(row.answer);
            numbers.push(
              Math.trunc(
                total_participants > 0
                  ? (row.answered_participants * 100) / total_participants
                  : 0
              )
            );
          });

          new Chart(canvas, {
            type: "bar",
            data: {
              labels: answers,
              datasets: [
                {
                  label: "Percentage of Answered Participants",
                  data: numbers,
                  borderWidth: 2,
                },
              ],
            },
            options: {
              layout: {
                padding: {
                  right: 45,
                  left: 15,
                },
              },
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: result.rows[0].question,
                  font: {
                    size: 45,
                  },
                },
                datalabels: {
                  align: "end",
                  anchor: "end",
                  formatter: (value) => value + "%",
                },
              },
              indexAxis: "y",
              scales: {
                x: {
                  max: 100,
                  min: 0,
                  display: false,
                },
                y: {
                  title: {
                    display: true,
                    text: "Answers",
                  },
                  grid: {
                    drawOnChartArea: false,
                  },
                  beginAtZero: true,
                },
              },
            },
          });

          const startpoll_btn = document.querySelector(".btn-start");
          const deletepoll_btn = document.querySelector(".btn-delete");

          startpoll_btn.addEventListener("click", () => {
            document.querySelector("form").action = "/presenter/history/" + id;
            document.querySelector("input[type='submit']").value = "Start Poll";
            chart_form.style.display = "flex";
            setTimeout(() => {
              document.body.style.backgroundColor = "grey";
              chart_form.style.opacity = 1;
            }, 1);

            document.querySelector("input[name='question']").value =
              result.rows[0].question;

            for (let i = 0; i < result.rows.length; i++) {
              if (i < document.querySelectorAll(".answer").length) {
                document
                  .querySelectorAll(".answer")
                  [i].querySelector(".answer-input").value =
                  result.rows[i].answer;
                continue;
              }
              const answer_input = document
                .querySelectorAll(".answer")[0]
                .cloneNode(true)
                .querySelector(".answer-input");
              answer_input.removeAttribute("required");
              answer_input.value = result.rows[i].answer;
              answers_container.appendChild(answer_input.parentNode);
            }
            addRadioListeners();

            already_marked = null;
            const answer_id_inputs = answers_container.querySelectorAll(
              "button > input[type='radio']"
            );
            for (let i = 0; i < result.rows.length; i++) {
              answer_id_inputs[i].classList.remove("btn-success");
              answer_id_inputs[i].value = result.rows[i].answer;
              if (result.rows[i].is_answer == 1) {
                already_marked = i;
                answer_id_inputs[i].checked = true;
                answer_id_inputs[i].classList.add("btn-success");
              }
            }
          });

          deletepoll_btn.addEventListener("click", () => {
            fetch(`/presenter/history/${id}`, {
              method: "DELETE",
            })
              .then((response) => response.json())
              .then((data) => {
                if (data) location.pathname = "/presenter/history";
              })
              .catch((error) => console.log(error));
          });
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    });
  });
});
