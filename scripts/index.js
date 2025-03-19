//loader
const showLoader = () => {
  document.getElementById("loader").classList.remove("hidden");
  document.getElementById("wordsContainer").classList.add("hidden");
};
const hideLoader = () => {
  document.getElementById("loader").classList.add("hidden");
  document.getElementById("wordsContainer").classList.remove("hidden");
};

document.getElementById("getStartedBtn").addEventListener("click", function () {
  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;

  if (password === "123456") {
    document.getElementById("banner-section").style.display = "none";
    document.getElementById("learn-section").style.display = "block";
    document.getElementById("navbar").style.display = "block";

    document.getElementById("faq").style.display = "block";

    Swal.fire({
      title: "Login Successful!!",
      text: "",
      icon: "success", // You can change this to 'error', 'warning', 'info', etc.
      confirmButtonText: "Ok", // Customize the button text
    });

    document
      .getElementById("logout-button")
      .addEventListener("click", function (event) {
        event.preventDefault();
        location.reload();
      });
  } else if (name.length < 3) {
    Swal.fire({
      title: "Incorrect Name!",
      text: "",
      icon: "warning",
    });
  } else {
    Swal.fire({
      title: "Incorrect password",
      text: "Please contact your admin to get your password!",
      icon: "error",
    });
  }
});

const loadLevels = async () => {
  const response = await fetch(
    "https://openapi.programming-hero.com/api/levels/all"
  );

  const data = await response.json();
  showLevels(data.data);
};

const showLevels = (lessons) => {
  lessons.forEach((element) => {
    const lessonContainer = document.getElementById("lesson-btn-container");

    // create element
    const lessonDiv = document.createElement("div");
    lessonDiv.innerHTML = `
    <button   id="lesson-btn-${element.level_no}"   onclick = "loadWords('${element.level_no}', this)"  class="text-[#422AD5] border border-bg-[#422AD5] px-2 py-2 hover:bg-[#422AD5] hover:text-[#C6BDBD] rounded cursor-pointer "> <i class="fa-solid fa-book-open "></i> Lesson -${element.level_no}</button>
    `;
    // append
    lessonContainer.appendChild(lessonDiv);
  });
};

// load words by levels
const loadWords = async (levels) => {
  showLoader();

  try {
    const response = await fetch(
      `https://openapi.programming-hero.com/api/level/${levels}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    removeActiveClass();
    const clickedButton = document.getElementById(`lesson-btn-${levels}`);
    clickedButton.classList.add("active");

    document.getElementById("select-lesson").classList.add("hidden");

    const data = await response.json();
    console.log("Data received:", data);

    if (!data || !data.data || data.data.length === 0) {
      displayErrorPage();
      hideLoader();
      return;
    }

    displayWords(data.data);
  } catch (error) {
    displayErrorPage();
  } finally {
    hideLoader();
  }
};

// error page
const displayErrorPage = () => {
  const wordsContainer = document.getElementById("wordsContainer");
  wordsContainer.innerHTML = `
    <div class=" col-span-full flex flex-col justify-center items-center text-center py-20 my-4">
    <img src="/assets/alert-error.png">
      <h2 class="text-2xl font-bold text-gray-600 noto-serif py-4">এই Lesson এ এখনো কোন Vocabulary যুক্ত করা হয়নি।</h2>
      <p class="text-2xl font-bold noto-serif py-4">নেক্সট Lesson এ যান</p>
    </div>
  `;
};

const displayWords = async (words) => {
  const wordsContainer = document.getElementById("wordsContainer");
  wordsContainer.innerHTML = "";

  words.slice(0, 9).forEach((word) => {
    const meaningText =
      word.meaning != null ? word.meaning : "অর্থ পাওয়া যায়নি";

    const wordsDiv = document.createElement("div");
    wordsDiv.innerHTML = `
    <div class="card container w-[350px] ">
  <div class="card-body items-center text-center justify-between relative my-4">
    <h2 class="card-title">${word.word}</h2>
    <h3>Meaning / Pronunciation</h3>
    <p>${meaningText}/${word.pronunciation}</p>
    <div class="flex justify-between absolute bottom-0 right-12 left-12 mt-12">
 
    <button onclick="wordDetails('${word.id}')" class="cursor-pointer">
    <i class="fa-solid fa-circle-question text-[#374957]"></i>
    </button>
    <button class="cursor-pointer pronounce-btn" data-word="${word.word}">
      <i class="fa-solid fa-volume-high text-[#374957]"></i>
    </button>
  </div>
  </div>
</div>
    `;

    // append the words container
    wordsContainer.appendChild(wordsDiv);
  });

  // Add event listeners to all pronunciation button
  document.querySelectorAll(".pronounce-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const wordToPronounce = this.getAttribute("data-word");
      pronounceWord(wordToPronounce);
    });
  });
};

// Function to pronounce the word
function pronounceWord(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}

const wordDetails = async (id) => {
  const response = await fetch(
    `https://openapi.programming-hero.com/api/word/${id}`
  );

  const data = await response.json();
  displayWordDetails(data.data);
};

const displayWordDetails = (words) => {
  document.getElementById("word_details").showModal();
  const detailsContainer = document.getElementById("details-container");

  const meaningText = words.meaning ? words.meaning : "অর্থ পাওয়া যায়নি";

  let synonymText = "";
  if (
    words.synonyms &&
    Array.isArray(words.synonyms) &&
    words.synonyms.length > 0
  ) {
    synonymText = words.synonyms
      .map((synonym) => {
        return `<button class="text-[#069adf] px-2 py-2 border-none">${synonym}</button>`;
      })
      .join(" ");
  } else {
    synonymText = "<h2>সমার্থক শব্দ পাওয়া যায়নি</h2>";
  }

  detailsContainer.innerHTML = `
  <div class="flex gap-3">
  <h1 class="text-2xl font-bold">${words.word}</h1>
  (<i class="fa-solid fa-microphone"></i>: <h1 class="noto-serif font-bold text-lg">${words.pronunciation}</h1>)
  </div>
  <h2 class="font-bold">Meaning</h2>
  <h3 class="text-gray-900">${meaningText}</h3>
  <h4 class="font-bold">Example</h4>
  <p>${words.sentence}</p>
  <h5 class="noto-serif">সমার্থক শব্দ গুলো</h5>
  <p>${synonymText}</p>

        
  `;
};

loadLevels();

// navbar sticky

const navbar = document.getElementById("navbar");

const stickyOffset = navbar.offsetTop;

const makeNavbarSticky = () => {
  if (window.scrollY >= stickyOffset) {
    navbar.classList.add("fixed", "top-0", "w-full", "z-50");
    navbar.classList.remove("bg-blue-500");
    navbar.classList.add("bg-white", "shadow-md");
  } else {
    navbar.classList.remove("fixed", "top-0", "w-full", "z-50");
    navbar.classList.remove("bg-white", "shadow-md");
    navbar.classList.add("bg-blue-500");
  }
};

window.addEventListener("scroll", makeNavbarSticky);

makeNavbarSticky();
function removeActiveClass() {
  const activeButtons = document.getElementsByClassName("active");

  for (let btn of activeButtons) {
    btn.classList.remove("active");
  }
}
