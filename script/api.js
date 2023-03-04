let form = document.querySelector(".form");
let result = document.querySelector(".result_container");
let prevNextContainer = document.querySelector(".prev_next_container");
let toolTipContainer = document.querySelector(".tool_tip_container");
let isPlaying = false;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let form = e.target;
  let button = e.target.querySelector("button[type='submit']");
  let formData = new FormData(form);
  let term = formData.get("term");

  result.innerHTML = `<span class="spinner spinner--quarter" style="--width: 28px;--color: #222;"></span>`;

  button.disabled = true;

  SEARCH_SONG_LIST(term, (res) => {
    button.disabled = false;
    result.innerHTML = "";

    if (res.data.length > 0) {
      res.data.forEach((item) => {
        result.innerHTML += `
            <div class="card" onclick="GET_LYRICS(${JSON.stringify(item).split('"').join("&quot;")}, this)">

              <div class="card-image">
                <img src="${item.artist.picture_medium}" alt="">
              </div>

              <div class="card-loader" hidden data-name="${item.title}">
                <div>
                  <span class="spinner spinner--quarter" style="--width: 48px;--color: #5abdff;"></span>
                </div>
              </div>

                <div class="card-title">
                  <p>${item.artist.name}</p>
                  <p>${item.title}</p>
                </div>

            </div>
        `;
      });
    } else {
      result.innerHTML = "Nenhum resultado para essa pesquisa...";
    }
  });
});

/**
 * It takes a search term and a callback function as arguments, then it fetches the data from the API
 * and passes the data to the callback function.
 * @param term - The search term
 * @param callback - a function that will be called when the data is ready.
 */
const SEARCH_SONG_LIST = async (term, callback) => {
  let res = await fetch(`https://api.lyrics.ovh/suggest/${term}`);
  let data = await res.json();

  callback(data);
};

/**
 * It gets the lyrics of a song and displays it on the page
 * @param songData - is an object that contains the artist name and song title.
 * @param divElement - The div element that was clicked.
 */
const GET_LYRICS = async (songData, divElement) => {
  let allDivElement = divElement.parentElement.querySelectorAll(".card");
  let cardLoaderAnimation = divElement.querySelector(".card-loader");

  allDivElement.forEach((item) => {
    item.style.opacity = "0.8";
    item.style.pointerEvents = "none";
  });

  cardLoaderAnimation.hidden = false;
  divElement.style.opacity = "1";

  fetch(`https://api.vagalume.com.br/search.php?art=${songData.artist.name}&mus=${songData.title}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.type !== "song_notfound") {
        let lyrics = data.mus[0].text;

        result.innerHTML = `
          <div class="lyrics-container">
            <div class="audio_container">
              <audio controls preload="auto" hidden>
                <source src="${songData.preview}" type="audio/mpeg">
              </audio>
          
              <button onclick="TOOGLE_PLAY(this)">
                <i class="fa fa-play"></i>
              </button>
            </div>

            <p class="title">${songData.artist.name} - ${songData.title}</p>
            <p class="lyrics">${lyrics.replace(/(\r\n|\r|\n)/g, "<br>")}</p>
          </div>
        `;
      } else {
        allDivElement.forEach((item) => {
          item.style.opacity = "1";
          item.style.pointerEvents = "all";
        });

        cardLoaderAnimation.hidden = true;
        divElement.style.opacity = "0.8";
        divElement.style.pointerEvents = "none";
        divElement.classList.add("inactive");

        TOOLTIP_ACTION();
      }
    });
};

const TOOLTIP_ACTION = () => {
  toolTipContainer.style.right = "10px";

  setTimeout(() => {
    toolTipContainer.style.right = "-9999px";
  }, 3000);
};


/**
 * It takes a button element as an argument, finds the audio element in the same parent element, and
 * toggles the play/pause state of the audio element.
 * @param btnElement - The button element that was clicked
 */
const TOOGLE_PLAY = (btnElement) => {
  let myAudio = btnElement.parentElement.querySelector("audio");
  let playPauseIcon = btnElement.querySelector("i");

  isPlaying ? myAudio.pause() : myAudio.play();

  myAudio.onplaying = () => {
    isPlaying = true;
    playPauseIcon.classList.remove("fa-play");
    playPauseIcon.classList.add("fa-pause");
  };
  myAudio.onpause = () => {
    isPlaying = false;
    playPauseIcon.classList.remove("fa-pause");
    playPauseIcon.classList.add("fa-play");
  };
}
