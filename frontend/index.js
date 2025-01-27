const API = "https://api.github.com/users/";
const get = (element) => document.getElementById(`${element}`);

const viewHistoryBtn = document.getElementById("viewHistoryBtn");
const historyContainer = document.getElementById("historyContainer");

const BACKEND_URL = "http://192.168.49.2:30064/api"; 

const input = get("input");
const btn = get("btn");

btn.addEventListener('click', () => {
    if (input.value != "") {
        fetchdev(API + input.value);
    }
});

input.addEventListener('keydown', (e) => {
    if (e.key == "Enter") {
        if (input.value != "") {
            fetchdev(API + input.value);
        }
    }
}, false);

async function fetchdev(url) {
    try {
        const response = await fetch(url);
        const dat = await response.json();
        if (!dat || dat.message === "Not Found") {
            throw new Error("User not found");
        }
        saveSearch(dat.login); // Save search to the backend
        displaydata(dat);
    } catch (error) {
        console.error("Error fetching user:", error);
        alert("Error fetching data: " + error.message);
    }
}

async function saveSearch(username) {
    try {
        await fetch(`${BACKEND_URL}/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
        });
    } catch (error) {
        console.error("Error saving search:", error);
    }
}

let dateSegment;
const noResults = document.querySelector("#noResults");

function displaydata(dat) {
    noResults.style.scale = 0;
    if (dat.message !== "Not Found") {
        function checkNull(apiItem, domItem) {
            if (apiItem === "" || apiItem === null) {
                domItem.style.opacity = 0.5;
                domItem.previousElementSibling.style.opacity = 0.5;
                return false;
            } else {
                return true;
            }
        }

        const image = document.querySelector("#userImage");
        const nam = document.querySelector(".name");
        const username = document.querySelector("#username");
        const date = document.querySelector("#date");
        const repo = document.querySelector("#repos");
        const follow = document.querySelector("#followers");
        const following = document.querySelector("#following");
        const location = document.querySelector("#location");
        const web = document.querySelector("#website");
        const twitter = document.querySelector("#twitter");
        const company = document.querySelector("#company");
        const profileBio = document.querySelector(".profileBio");
        const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        nam.innerText = dat?.name;
        image.src = `${dat?.avatar_url}`;
        username.innerText = `@${dat?.login}`;
        username.href = `${dat?.html_url}`;
        date.innerText = `Joined ${dat.created_at.split('-')[2].slice(0, 2)} ${month[parseInt(dat.created_at.split('-')[1]) - 1]} ${dat.created_at.split('-')[0]}`;
        
        repo.innerText = dat?.public_repos;
        profileBio.innerText = (dat?.bio === null) ? "This Profile has no Bio" : dat?.bio;
        
        follow.innerText = dat?.followers;
        following.innerText = dat?.following;

        location.innerText = checkNull(dat?.location, location) ? dat?.location : "Not Available";
        web.innerText = checkNull(dat?.blog, website) ? dat?.blog : "Not Available";

        web.href = checkNull(dat?.blog, website) ? dat?.blog : "#";

        twitter.innerText = checkNull(dat?.twitter_username, twitter) ? dat?.twitter_username : "Not Available";

        twitter.href = checkNull(dat?.twitter_username, twitter) ? `https://twitter.com/${dat?.twitter_username}` : "#";

        company.innerText = checkNull(dat?.company, company) ? dat?.company : "Not Available";
    } else {
        noResults.style.scale = 1;
        setTimeout(() => {
            noResults.style.scale = 0;
        }, 2500);
    }
}

const modeBtn = document.querySelector("#modeBtn");
const modeText = document.querySelector("#modeText");
const modeIcon = document.querySelector("#modeIcon");
let darkMode = false;
const root = document.documentElement.style;

modeBtn.addEventListener("click", () => {
    if (darkMode === false) {
        enableDarkMode();
    } else {
        enableLightMode();
    }
});

function enableDarkMode() {
    root.setProperty("--lm-bg", "#141D2F");
    root.setProperty("--lm-bg-content", "#1E2A47");
    root.setProperty("--lm-text", "white");
    root.setProperty("--lm-text-alt", "white");
    root.setProperty("--lm-shadow-xl", "rgba(70,88,109,0.15)");
    modeText.innerText = "LIGHT";
    root.setProperty("--lm-icon-bg", "brightness(1000%)");
    darkMode = true;
    localStorage.setItem("dark-mode", true);
}

function enableLightMode() {
    root.setProperty("--lm-bg", "#F6F8FF");
    root.setProperty("--lm-bg-content", "#FEFEFE");
    root.setProperty("--lm-text", "#4B6A9B");
    root.setProperty("--lm-text-alt", "#2B3442");
    root.setProperty("--lm-shadow-xl", "rgba(70, 88, 109, 0.25)");
    modeText.innerText = "DARK";
    root.setProperty("--lm-icon-bg", "brightness(100%)");
    darkMode = false;
    localStorage.setItem("dark-mode", false);
}

const prefersDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

if (localStorage.getItem("dark-mode") === null) {
    if (prefersDarkMode) {
        enableDarkMode();
    } else {
        enableLightMode();
    }
} else {
    if (localStorage.getItem("dark-mode") === "true") {
        enableDarkMode();
    } else {
        enableLightMode();
    }
}

viewHistoryBtn.addEventListener("click", async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/search-history`); // Use the dynamic backend URL
        const history = await response.json();

        if (history.length > 0) {
            historyContainer.innerHTML = `
                <h3>Search History</h3>
                <ul>
                    ${history.map(item => `<li>${item.username} - ${new Date(item.searchedAt).toLocaleString()}</li>`).join('')}
                </ul>
            `;
        } else {
            historyContainer.innerHTML = "<p>No search history found.</p>";
        }
    } catch (error) {
        console.error("Error fetching search history:", error);
        historyContainer.innerHTML = "<p>Failed to fetch search history.</p>";
    }
});
