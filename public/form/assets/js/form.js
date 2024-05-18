document.addEventListener("DOMContentLoaded", () => {
  if (!location.pathname.startsWith("/profile")) {
    var pw_visibility_btn = document.querySelector(".pw-visibility");
    var confirm_pw_visibility_btn = document.querySelector(
      ".confirm-pw-visibility"
    );
    var pw_input = document.querySelector("#password");
    var confirm_pw_input = document.querySelector("#confirm-password");

    handleVisibility(pw_visibility_btn, pw_input);
    if (confirm_pw_input)
      handleVisibility(confirm_pw_visibility_btn, confirm_pw_input);

    function handleVisibility(btn, input) {
      var eye_icon = btn.querySelector(":first-child");
      btn.addEventListener("click", () => {
        if (input.type === "text") {
          input.type = "password";
          eye_icon.src = "/form/hidepw.png";
        } else {
          input.type = "text";
          eye_icon.src = "/form/showpw.png";
        }
      });
    }
  } else {
    document.querySelector(".logout").addEventListener("click", () => {
      location.pathname = "/logout";
    });
  }
});
