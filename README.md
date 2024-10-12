# Real Time Quiz

#### Description:

I created this program because I have been noticing some of my classmates hesitate to answer questions in class due to shyness. So, I designed this program with [Express.js](https://expressjs.com/) to empower engagement between students and teachers for taking quizzes whether it is done in-class or remotely.

#### How to install and run

##### - Install `npm` (Node Package Manager)
To get npm, you need to install [Node.js](https://nodejs.org/en/download) with which npm is bundled. Therefore, by installing Node.js, npm will be also installed on the system.

##### - If Node.js is already on the machine
If your machine has Node.js of version 14 or higher, you will need to run `npm install` in the terminal after cloning this project.

##### - Run the project
Initiate this program by running `npx nodemon`. After that, test it via browser at `localhost:3000`. **The terminal in which `npx nodemon` was run is needed to be keep running in the background**.

#### How this program works

- There are two types of users in this program, presenter and participant.
- The program will generate a unique URL for both users at registration. The URL is used by other participants to engage in the quizzes.
- Since the program utilizes **WebSocket**, every data and activities can be seen in real time without the need to refresh the browser.

#### How to interact with the program

##### Presenters can
- Create a quiz by clicking the `Add New Activity` button.
- Let others participate in the quizzes by activating them. This can be done by clicking on the table row on the `presenter/history` page.
- Look the activities of the activated quiz in real time on the `presenter/activity` page.
- End a quiz by clicking the `End Poll` button.
  
##### Participants can
- Participate by typing the exact URL of the quiz. From there, answers can be chosen and the program will show whether it is correct.
- Review previous engagements in past quizzes.

#### Critical reflection of the project experience

- This is the first project of mine, dealing with `Socket.IO` and `Express.js`. So, I knew a lot about handling requests, responses, and websockets.
- I believe that I have learnt a lot about MySql query from this project. The way I wanted to display data, which includes different joining methods with several tables, was quite challenging.
- I also believe that I need to adopt more of DRY principle since I noticed some repeated part of the code which I can improve by refactoring.
