const TOLA = 11.664;

// DEFAULT VALUES
let state = {
  gold: 301300,
  silver: 3800,
  date: "2083-Baishak-08",
  sheetURL: "https://script.google.com/macros/s/AKfycbzVj_QR5TQjSukKCwrtccnKfVohB9K3ajF8tB69J4vPWosMBzFepoLiQNihduMUurDb/exec"
};

// LOAD LOCAL STORAGE
if (localStorage.getItem("state")) {
  state = JSON.parse(localStorage.getItem("state"));
}

// ELEMENTS
const goldTola = document.getElementById("goldTola");
const gold10g = document.getElementById("gold10g");
const silverTola = document.getElementById("silverTola");
const silver10g = document.getElementById("silver10g");

const dateEl = document.getElementById("date");
const timeEl = document.getElementById("time");
const ticker = document.getElementById("ticker");

// ADMIN
const admin = document.getElementById("admin");
const goldInput = document.getElementById("goldInput");
const silverInput = document.getElementById("silverInput");
const dateInput = document.getElementById("dateInput");
const sheetInput = document.getElementById("sheetInput");

// FORMAT
function rs(n) {
  return "Rs " + Math.round(n).toLocaleString();
}

// RENDER
function render() {
  const g10 = state.gold / TOLA * 10;
  const s10 = state.silver / TOLA * 10;

  // --- AUTOMATIC NEPALI BS DATE LOGIC ---
  const today = new Date();
  
  const bsMonths = [
    "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", 
    "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
  ];

  let adYear = today.getFullYear();
  let adMonth = today.getMonth(); // 0 (Jan) to 11 (Dec)
  let adDay = today.getDate();

  let bsYear, bsMonthIndex, bsDay;

  // Calculation for the current period (April 2026)
  // April 14, 2026 is roughly Baisakh 1, 2083
  if (adMonth > 3 || (adMonth === 3 && adDay >= 14)) {
    bsYear = adYear + 57;
    bsMonthIndex = (adMonth - 3); // April becomes 0 (Baisakh)
    bsDay = adDay - 13; // April 21 becomes 8
  } else {
    bsYear = adYear + 56;
    bsMonthIndex = (adMonth + 8); // Jan becomes 9 (Magh)
    bsDay = adDay + 15; // Approximate offset for earlier months
  }

  // Formatting the string: Year - Month - Date
  const autoDateBS = `${bsYear} - ${bsMonths[bsMonthIndex]} - ${bsDay}`;

  // Update Display Elements
  dateEl.textContent = autoDateBS;
  goldTola.textContent = rs(state.gold);
  gold10g.textContent = rs(g10);
  silverTola.textContent = rs(state.silver);
  silver10g.textContent = rs(s10);

  // Update Ticker
  ticker.textContent = 
    `GOLD TOLA: ${rs(state.gold)} | GOLD 10G: ${rs(g10)} | ` +
    `SILVER TOLA: ${rs(state.silver)} | SILVER 10G: ${rs(s10)} | ` +
    `DATE: ${autoDateBS} ——— `;
}

// TIME (NEPAL 12 HOUR)
function updateTime() {
  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  let ampm = h >= 12 ? "PM" : "AM";

  h = h % 12 || 12;
  m = m < 10 ? "0" + m : m;

  timeEl.textContent = `Nepal Time: ${h}:${m} ${ampm}`;
}

setInterval(updateTime, 1000);

// ADMIN OPEN (CTRL)
//document.addEventListener("keydown", e => {
//  if (e.key === "Control") {
  //  admin.classList.toggle("hidden");
//  }
//});

// SAVE
document.getElementById("save").onclick = () => {
  state.gold = Number(goldInput.value || state.gold);
  state.silver = Number(silverInput.value || state.silver);
  state.date = dateInput.value || state.date;
  state.sheetURL = sheetInput.value || state.sheetURL;

  localStorage.setItem("state", JSON.stringify(state));

  admin.classList.add("hidden");
  render();
};

// CLOSE
document.getElementById("close").onclick = () => {
  admin.classList.add("hidden");
};

// GOOGLE SHEETS SYNC (OPTIONAL)
async function syncSheet() {
  // Use the Web App URL from Step 2 here in your Admin Panel
  if (!state.sheetURL) return;

  try {
    const res = await fetch(state.sheetURL);
    const data = await res.json();

    if (data.gold && data.silver) {
      state.gold = Number(data.gold);
      state.silver = Number(data.silver);
      console.log("Sync Successful:", data);
      render();
    }
  } catch (e) {
    console.error("Connection Error. Make sure you used the Google Web App URL.");
  }
}
// INIT
render();
updateTime();
setInterval(syncSheet, 30000); // optional sync every 30s
