const date = new Date();
const hasVisited = localStorage.getItem("hasVisited");

document.querySelector("section p span").textContent = date.getFullYear();

if (!hasVisited) {
  localStorage.setItem("hasVisited", "true");
} else {
  window.location.href = "home.html";
}
