window.onscroll = function () {
  STYICKY_HEADER();
};

let header = document.querySelector(".search_container");
let sticky = header.offsetTop;
let loader = document.querySelector(".loader");

const STYICKY_HEADER = () => {
  if (window.pageYOffset > sticky) {
    header.classList.add("sticky");
  } else {
    header.classList.remove("sticky");
  }
};

window.addEventListener("load", () => (loader.style.display = "none"));
