# Real Time Quiz

#### Note:

**This project is my two months' worth final project for my school. Therefore, the code is for reference only and should not be copied by other students.**

#### Description:

This [Express](https://expressjs.com/) website is designed to empower the increase in the in-class engagement for activities such as taking quizzes.

#### How to install and run

To run this program on your local machine, `npm` (Node package manager) is necessary to install the necessary dependencies. To get npm, you need to install [Node.js](https://nodejs.org/en/download) with which npm is bundled. Therefore, by installing Node.js, npm will be also installed on the system.

Once these prerequisites are met, in the project directory, open the terminal and execute the command `npm install` to install the necessary packages. After that, to run the project, run `npx nodemon .` in the terminal. This will initiate the program, which can then be accessed and tested via `localhost:3000` in your web browser. **In the background, you need to keep opening the terminal in which `npx nodemon .` was run**

#### How this program works

- In this program, there will be two types of users, presenter and participant. Before choosing the user type, every user needs to log in or sign up if the user doesn't have an account. 
- No matter the user type, the program will generate a unique URL after registration. The URL is used to identify each quiz for other participants to participate. One can participate in quizzes only if they know the URL.
- Since the program utilizes the features of **WebSocket**, the presenter can see other participants' activities in real time. In addition, participants can also see the status of a quiz in real-time without the need to refresh the browser.

#### How to interact with the program

For presenter

- Presenters can create a quiz by clicking the `Add New Activity` button.
- Presenters can let others participate in their quizzes by activating them. This can be done by clicking on the table row on the `presenter/history` page. After that, the program will confirm the quiz information and click the `Start Poll` button to activate.
- Presenters can see the participants' activities of their activated quiz in real time on the `presenter/activity` page.
- Presenters can end a quiz by clicking the `End Poll` button.
  
For participant

- Participants can participate by typing the URL of the quiz.
- From there, the user can choose the available answer and the program will show whether the chosen answer is right or wrong.
- Participant can review their previous engagements in different quizzes.

#### Critical reflection of the project experience

- One of the significant challenges I faced was using `Socket.IO` and `Express.js` for the first time. As with any new technology, there was a steep learning curve involved. Understanding the nuances of these technologies, such as how to set up a server, handle requests and responses, and manage real-time communication, was quite challenging. 
Additionally, crafting a `SELECT` query to display the desired records to the user posed its own set of challenges. There were times when things didn’t work as expected, which required a lot of debugging and problem-solving.
- The experience taught me valuable lessons. One of the most important was learning how to think in terms of `Express.js` and `Socket.IO`. This involved understanding the event-driven nature of Node.js, the concept of middleware in `Express.js`, and the real-time bi-directional communication provided by `Socket.IO`. I learned how to structure an application using `Express.js`, create routes, and handle different types of `HTTP` requests. 
With `Socket.IO`, I learned how to emit events, handle them on the client side, and manage communication between the server and clients. This project helped me understand the power and flexibility of these technologies.
- Reflecting on the project, there are several areas where I could improve. One of them is adopting more of the DRY (Don’t Repeat Yourself) principle. There were instances where I found myself writing similar code in multiple places. By identifying these patterns and abstracting them into reusable functions or middleware, I could make the code more efficient, readable, and maintainable. 
Another area of improvement is refactoring the code. As I gained more understanding of `Express.js` and `Socket.IO`, I realized that some parts of the code could be written more efficiently or structured better. Regular refactoring can help improve the quality of the code and make it easier to add new features in the future.
