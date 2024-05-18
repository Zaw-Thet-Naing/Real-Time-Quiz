const links = {
  "/presenter/": "a[title='History']",
  "/presenter/history": "a[title='History']",
  "/participant/history": "a[title='History']",
  "/presenter/activity": "a[title='Current Activity']",
  "/participant/participate": "a[title='Participate']",
  "/participant/": "a[title='Participate']",
  "/presenter/profile": "a[title='Profile']",
  "/participant/profile": "a[title='Profile']",
};

var wrapper = document.querySelector(".wrapper");
var pathname = location.pathname;

if (pathname.startsWith("/participant/participate")) {
  document.querySelector("a[title='Participate']").style.backgroundColor =
    "rgb(2, 18, 32)";
} else
  document.querySelector(links[pathname]).style.backgroundColor =
    "rgb(2, 18, 32)";
