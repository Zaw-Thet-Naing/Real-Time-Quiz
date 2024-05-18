Chart.register(ChartDataLabels);

document.addEventListener("DOMContentLoaded", (event) => {
  const table_rows = document.querySelectorAll("tbody > tr");
  table_rows.forEach((row) => {
    row.addEventListener("click", () => {
      const chosen_answer_id = row.children[3].innerHTML;
      document
        .querySelector(".cancel-chart-view")
        .addEventListener("click", () => {
          location.pathname = "/participant/history";
        });

      const id = row.children[0].innerHTML;

      fetch(`/presenter/history/${id}`)
        .then((response) => {
          if (!response.ok) throw new Error("Network response was not ok");

          return response.json();
        })
        .then((result) => {
          const total_participants = result.total_participants;

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
        });

      fetch(`/participant/get_answers/${id}`)
        .then((response) => response.json())
        .then((answers) => {
          const answer_wrapper = document.querySelector(".answer-wrapper");
          let answer = document.createElement("div");

          answers.forEach((row, index) => {
            answer.id = row.id;
            answer.innerHTML = row.answer;
            const cloned_answer = answer.cloneNode(true);
            if (row.is_answer) {
              cloned_answer.style.border = "3px solid green";
              cloned_answer.style.backgroundColor = "#1ab502";
            }
            if (row.id == chosen_answer_id) {
              if (!row.is_answer) {
                cloned_answer.style.border = "3px solid red";
                cloned_answer.style.backgroundColor = "#fc473a";
              }
            }
            answer_wrapper.appendChild(cloned_answer);
          });
        });
    });
  });
});
