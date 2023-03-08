let form = document.querySelector(".form");
let result = document.querySelector(".result_container");
let lyricResult = document.querySelector(".lyric_result_container");
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

    lyricResult.style.display = "none";
  });
});

/**
 * It takes a search term and a callback function as arguments, then it fetches the data from the API
 * and passes the data to the callback function.
 * @param term - The search term
 * @param callback - a function that will be called when the data is ready.
 */
const SEARCH_SONG_LIST = async (term, callback) => {
  let res = await fetch(`https://musicnation.herokuapp.com/getsong/${term}`);
  let data = await res.json();

  callback(data);
};

/**
 * It fetches the lyrics of a song from a server and displays it on the page
 * @param songData - {
 * @param divElement - The div element that was clicked
 */
const GET_LYRICS = async (songData, divElement) => {
  let allDivElement = divElement.parentElement.querySelectorAll(".card");
  let cardLoaderAnimation = divElement.querySelector(".card-loader");

  allDivElement.forEach((item) => {
    item.style.opacity = "0.7";
    item.style.pointerEvents = "none";
  });

  cardLoaderAnimation.hidden = false;
  divElement.style.opacity = "1";

  let songFileUrl = songData.preview.substring(7);

  fetch(`https://musicnation.herokuapp.com/getlyrics/${songData.artist.name}/${songData.title}/${songFileUrl.replace(/\//g, "SLASH")}`)
    .then((response) => response.json())
    .then((data) => {
      if (!data.type.includes("not")) {
        let lyrics = data.mus[0].text;
        let regexPattern = /\[(.*?)\]/;
        let translatedLyrics;
        let updatedString = "";
        let textInsideBrackets = "";

        if (data.mus[0].translate) {
          translatedLyrics = data.mus[0].translate[0].text;
          let match = translatedLyrics.match(regexPattern);
          textInsideBrackets = match[1];
          updatedString = translatedLyrics.replace(match[0], "").trimStart();
        }

        lyricResult.innerHTML = `
          <div class="lyrics-container">
            <div class="audio_container">
              <audio controls preload="auto" hidden>

              </audio>
          
              <button onclick="TOOGLE_PLAY(this)" style="display: flex" disabled>
                <span class="spinner spinner--quarter" style="--width: 20px;--color: #222;"></span>
              </button>
            </div>

            <div class="lyrics_div" style="${data.mus[0].translate ? "justify-content: center" : "justify-content: start"}">
              <div>
                <p class="title">${songData.artist.name} - ${songData.title}</p>
                <p class="lyrics">${lyrics.replace(/(\r\n|\r|\n)/g, "<br>")}</p>
              </div>
              <div class="translated" style="${data.mus[0].translate ? "display: block" : "display: none"}">
                <p class="title">${songData.artist.name} - ${textInsideBrackets}</p>
                <p class="lyrics">${updatedString.replace(/(\r\n|\r|\n)/g, "<br>")}</p>
              </div>          
            </div>
          </div>
        `;

        lyricResult.style.display = "block";
        lyricResult.querySelector("button").disabled = false;

        fetch("https://musicnation.herokuapp.com/getsongfile/")
          .then((response) => response.blob())
          .then((blob) => {
            const url = URL.createObjectURL(blob);
            const audio = new Audio();
            audio.src = url;
            audio.controls = true;

            lyricResult.querySelector("audio").innerHTML = `<source src="${url}" type="audio/mpeg">`;
            lyricResult.querySelector("button").innerHTML = `<i class="fa fa-play"></i>`;
            lyricResult.querySelector("button").disabled = false;
          });

        allDivElement.forEach((item) => {
          item.style.opacity = "1";
          item.style.pointerEvents = "all";
        });

        cardLoaderAnimation.hidden = true;
        window.scrollTo(0, 0);
      } else {
        allDivElement.forEach((item) => {
          item.style.opacity = "1";
          item.style.pointerEvents = "all";
        });

        cardLoaderAnimation.hidden = true;
        divElement.style.opacity = "0.7";
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
};
