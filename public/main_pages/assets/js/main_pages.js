const routes = {
  "": "home.html",
  "#about": "about.html",
  "#contact": "contact.html",
};

document.addEventListener("DOMContentLoaded", () => {
  var nav = document.querySelector(".nav");
  var wrapper = document.querySelector(".wrapper");
  var toolbar = document.querySelector(".toolbar");
  var barOne = document.querySelector(".bar-one");
  var barTwo = document.querySelector(".bar-two");
  var barThree = document.querySelector(".bar-three");
  var toolbar_navs = document.querySelector(".toolbar-navs");

  handleView("/main_pages/home.html");

  fetch("/check_cookie")
    .then((response) => response.json())
    .then((logined) => {
      var login_profile = document.querySelector(".login-profile");
      var logout_profile = document.querySelector(".logout-profile");
      var toolbar_login_profile = document.querySelector(
        ".toolbar-navs-login-profile"
      );
      var toolbar_logout_profile = document.querySelector(
        ".toolbar-navs-logout-profile"
      );
      login_profile.style.display = logined ? "flex" : "none";
      logout_profile.style.display = logined ? "none" : "flex";
      toolbar_login_profile.style.display = logined ? "flex" : "none";
      toolbar_logout_profile.style.display = logined ? "none" : "flex";
    });

  function handleView(file) {
    fetch(file)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((htmlContent) => {
        wrapper.innerHTML = htmlContent;
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }

  wrapper.addEventListener("click", (event) => {
    if (toolbar_navs.classList.contains("toolbar-navs-show")) {
      cancelToolBarNav();
    }
    if (event.target.tagName === "BUTTON") {
      if (event.target.id === "btn-presenter") {
        location.pathname = "/presenter";
      } else if (event.target.id === "btn-participant") {
        location.pathname = "/participant";
      }
    }
  });

  nav.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      event.preventDefault();
      var endpoint = event.target.getAttribute("href");
      if (routes.hasOwnProperty(endpoint)) {
        var url = event.target.getAttribute("href");
        history.pushState(null, null, `/${url}`);
        handleView("/main_pages/" + routes[endpoint]);
      }
    } else if (event.target.tagName === "BUTTON") {
      if (event.target.id === "login") location.pathname = "/login";
      else location.pathname = "/register";
    }
  });

  toolbar.addEventListener("click", () => {
    if (getComputedStyle(toolbar_navs).display === "none") {
      toolbar_navs.classList.add("toolbar-navs-show");
      setTimeout(() => {
        toolbar_navs.style.transform = "translateX(0)";
      }, 1);
      barOne.classList.add("toolbar-action-one");
      barTwo.classList.add("toolbar-action-two");
      barThree.classList.add("toolbar-action-three");
    } else {
      cancelToolBarNav();
    }
  });

  toolbar_navs.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      cancelToolBarNav();

      var endpoint = event.target.getAttribute("href");
      if (routes.hasOwnProperty(endpoint)) {
        event.preventDefault();
        var url = event.target.getAttribute("href");
        history.pushState(null, null, url);
        handleView("/main_pages/" + routes[endpoint]);
      }
    }
  });

  function cancelToolBarNav() {
    toolbar_navs.classList.remove("toolbar-navs-show");
    barOne.classList.remove("toolbar-action-one");
    barTwo.classList.remove("toolbar-action-two");
    barThree.classList.remove("toolbar-action-three");
  }
});
