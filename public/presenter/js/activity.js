Chart.register(ChartDataLabels);

document.addEventListener("DOMContentLoaded", () => {
  let canvas = document.querySelector("canvas");
  let chart;
  let rows = [];
  let answers = [];
  let numbers = [];
  let participant_activity_holder;
  const socket = io("http://localhost:3000/");

  const chart_form = document.querySelector(".chart-form");
  if (document.querySelector(".add-activity")) {
    document.querySelector(".add-activity").addEventListener("click", () => {
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
      const answer_input_container =
        answer_inputs_containers[0].cloneNode(true);
      answer_input_container
        .querySelector(".answer-input")
        .removeAttribute("required");
      answer_input_container.querySelector(".answer-input").value = "";
      answer_input_container
        .querySelector("input[type='radio']")
        .classList.remove("btn-success");
      answer_input_container.querySelector(
        "input[type='radio']"
      ).checked = false;
      answer_input_container.querySelector("input[type='radio']").value = "";
      answers_container.appendChild(answer_input_container);
      addRadioListeners();
    });

    document.querySelector(".cancel").addEventListener("click", () => {
      chart_form.style.display = "none";
      document.body.style.backgroundColor = "";
      chart_form.style.opacity = 0;
    });
    document.addEventListener("keydown", (event) => {
      if (event.key == "Escape") {
        chart_form.style.display = "none";
        document.body.style.backgroundColor = "";
        chart_form.style.opacity = 0;
      }
    });

    function addRadioListeners() {
      document
        .querySelectorAll("input[type='radio']")
        .forEach((radio, index) => {
          let answer_input_value = document
            .querySelectorAll(".answer")
            [index].querySelector("input[type='text']").value;
          if (answer_input_value == "") radio.disabled = true;
          else radio.disabled = false;
          radio.addEventListener("change", () => {
            radio.value =
              document.querySelectorAll(".answer-input")[index].value;
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

      const inputFields = document.querySelectorAll(
        ".form-control.answer-input"
      );
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
  }

  if (canvas) {
    const id = document.querySelector(".chart").id;
    const url = document.querySelector(".url").innerHTML;
    const total_holder = document.querySelector("#total");

    fetch("/participant/participant_activity/")
      .then((response) => response.json())
      .then((participant_activity) => {
        participant_activity_holder = participant_activity[url];
        fetch(`/presenter/history/${id}`)
          .then((response) => response.json())
          .then((result) => {
            rows = result.rows;
            document
              .querySelector(".present-poll")
              .addEventListener("click", () => {
                canvas.requestFullscreen();
              });

            let total_participants = 0;
            if (participant_activity_holder) {
              for (const answer in participant_activity_holder) {
                total_participants += Object.keys(
                  participant_activity_holder[answer]
                ).length;
              }
            }
            total_holder.innerHTML =
              "Total Participants - " + total_participants;

            result.rows.forEach((row) => {
              answers.push(row.answer);
              numbers.push(0);
            });

            for (const answer in participant_activity_holder) {
              result.rows.forEach((row, index) => {
                if (row.answer_id == answer) {
                  numbers[index] = Math.trunc(
                    (Object.values(participant_activity_holder[answer]).length *
                      100) /
                      total_participants
                  );
                }
              });
            }

            // result.rows.forEach((row, index) => {
            //   if (participant_activity_holder[url]) {
            //     console.log(participant_activity_holder);
            //     for (const answer in participant_activity_holder) {
            //       if (answer == row.answer_id) {
            //         numbers.push(
            //           Math.trunc(
            //             (Object.values(participant_activity_holder).length *
            //               100) /
            //               Object.keys(participant_activity_holder).length
            //           )
            //         );
            //         break;
            //       }
            //     }
            //   }
            // });

            chart = new Chart(canvas, {
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
                    right: 60,
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

            socket.on("chose_answer", (participant_activity) => {
              if (participant_activity[url]) {
                participant_activity_holder = participant_activity[url];
                let total_participants = 0;
                for (const participant in participant_activity[url]) {
                  total_participants += Object.keys(
                    participant_activity[url][participant]
                  ).length;
                }
                total_holder.innerHTML =
                  "Total Participants - " + total_participants;
                result.rows.forEach((row, i) => {
                  Object.keys(participant_activity[url]).forEach(
                    (answer, j) => {
                      if (row.answer_id == answer) {
                        numbers[i] =
                          Math.trunc(
                            Object.keys(participant_activity[url][answer])
                              .length * 100
                          ) / total_participants;
                      }
                    }
                  );
                });
                chart.update();
              }
            });
          });
      });

    document.querySelector(".end-poll").addEventListener("click", () => {
      socket.emit("poll_ended", url);
      if (participant_activity_holder) {
        const data = {
          poll_id: rows[0].poll_id,
          answers: participant_activity_holder,
        };
        fetch(`/presenter/history/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }).catch((error) => {
          console.error("Error:", error);
        });
      }
      location.pathname = "/presenter/activity";
    });
  }
});
