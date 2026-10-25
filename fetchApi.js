// ============================================================
// 1. KHAI BÁO CÁC ELEMENT CẦN DÙNG
// ============================================================
const els = {
  unitToggle: document.querySelector("#unit-toggle"),
  searchInput: document.querySelector('.search input[type="search"]'),
  
  // Hero
  hero: document.querySelector(".hero"),
  eyebrow: document.querySelector(".hero .eyebrow"),
  city: document.querySelector(".hero .city"),
  tempC: document.querySelector(".hero .temp .u-c"),
  tempF: document.querySelector(".hero .temp .u-f"),
  desc: document.querySelector(".hero .temp-side strong"),
  feelsC: document.querySelector(".hero .temp-side .u-c"),
  feelsF: document.querySelector(".hero .temp-side .u-f"),
  hiLo: document.querySelector(".hero .hi-lo"),
  chipRain: document.querySelector(".chips li:nth-child(1)"),
  chipWind: document.querySelector(".chips li:nth-child(2)"),
  chipHumid: document.querySelector(".chips li:nth-child(3)"),

  // Stats (Chỉ số nhanh)
  humidityValue: document.querySelectorAll(".stats .stat")[0]?.querySelector(".stat__value"),
  humidityNote: document.querySelectorAll(".stats .stat")[0]?.querySelector(".stat__note"),
  windValue: document.querySelectorAll(".stats .stat")[1]?.querySelector(".stat__value"),
  windNote: document.querySelectorAll(".stats .stat")[1]?.querySelector(".stat__note"),
  uvValue: document.querySelectorAll(".stats .stat")[2]?.querySelector(".stat__value"),
  uvNote: document.querySelectorAll(".stats .stat")[2]?.querySelector(".stat__note"),
  visibilityValue: document.querySelectorAll(".stats .stat")[3]?.querySelector(".stat__value"),
  visibilityNote: document.querySelectorAll(".stats .stat")[3]?.querySelector(".stat__note"),
};

// ============================================================
// 2. API KEY
// ============================================================
const myAPIKey = "BK9YAB7Y9MXD9K6F7E7D8HHAM";

// ============================================================
// 3. HÀM GỌI API VÀ RENDER DỮ LIỆU
// ============================================================
async function getData() {
  try {
    const searchCity = els.searchInput.value.trim();
    if (!searchCity) {
      console.warn("Chưa nhập thành phố");
      return;
    }

    const cityEncoded = encodeURIComponent(searchCity);
    // Thêm include=current để chắc chắn có currentConditions
    const API = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${cityEncoded}?unitGroup=metric&key=${myAPIKey}&contentType=json&include=current,days`;

    console.log("Đang tìm:", searchCity);
    const response = await fetch(API);

    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }

    const result = await response.json();

    // ============================================================
    // PHÂN RÃ DỮ LIỆU
    // ============================================================
    const weather = {
      current: {
        temp: result.currentConditions.temp,
        feelsLike: result.currentConditions.feelslike,
        conditions: result.currentConditions.conditions,
        icon: result.currentConditions.icon,
        humidity: result.currentConditions.humidity,
        windSpeed: result.currentConditions.windspeed,
        windDir: result.currentConditions.winddir,
        uvIndex: result.currentConditions.uvindex,
        visibility: result.currentConditions.visibility,
        precipProb: result.currentConditions.precipprob,
        timeEpoch: result.currentConditions.datetimeEpoch,
      },
      daily: result.days.map((day) => ({
        dateEpoch: day.datetimeEpoch,
        tempMax: day.tempmax,
        tempMin: day.tempmin,
        conditions: day.conditions,
        icon: day.icon,
      }))
    };

    // ============================================================
    // RENDER: HERO (THỜI TIẾT HIỆN TẠI)
    // ============================================================
    
    // Tên thành phố
    els.city.innerHTML = result.resolvedAddress + ' <span class="city__pin" aria-hidden="true">📍</span>';

    // Ngày giờ
    const ngayGio = new Intl.DateTimeFormat("vi-VN", {
      timeZone: result.timezone,
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(weather.current.timeEpoch * 1000));
    els.eyebrow.innerHTML = ngayGio;

    // Nhiệt độ
    const c = weather.current.temp;
    els.tempC.innerHTML = Math.round(c);
    els.tempF.textContent = Math.round((c * 9) / 5 + 32);

    // Cảm giác như
    const f = weather.current.feelsLike;
    els.feelsC.textContent = Math.round(f) + "°";
    els.feelsF.textContent = Math.round((f * 9) / 5 + 32) + "°";

    // Mô tả
    els.desc.innerHTML = weather.current.conditions;

    // Cao / Thấp
    const today = weather.daily[0];
    els.hiLo.innerHTML =
      `Cao <span class="u-c">${Math.round(today.tempMax)}°</span><span class="u-f">${Math.round(today.tempMax * 9 / 5 + 32)}°</span>` +
      ` <span class="dot">·</span> ` +
      `Thấp <span class="u-c">${Math.round(today.tempMin)}°</span><span class="u-f">${Math.round(today.tempMin * 9 / 5 + 32)}°</span>`;

    // Chips
    els.chipRain.textContent = `🌧️ ${weather.current.precipProb}% mưa`;
    els.chipWind.textContent = `💨 ${Math.round(weather.current.windSpeed)} km/h`;
    els.chipHumid.textContent = `💧 ${Math.round(weather.current.humidity)}%`;

    // ============================================================
    // RENDER: STATS (CHỈ SỐ NHANH)
    // ============================================================
    
    // 1. Độ ẩm
    els.humidityValue.textContent = Math.round(weather.current.humidity) + "%";
    if (weather.current.humidity < 40) els.humidityNote.textContent = "Khô";
    else if (weather.current.humidity <= 70) els.humidityNote.textContent = "Dễ chịu";
    else els.humidityNote.textContent = "Ẩm ướt";

    // 2. Gió
    els.windValue.innerHTML = `${Math.round(weather.current.windSpeed)} <small>km/h</small>`;
    const huongGio = ["Bắc", "Đông Bắc", "Đông", "Đông Nam", "Nam", "Tây Nam", "Tây", "Tây Bắc"];
    const viTriGio = Math.round(weather.current.windDir / 45) % 8;
    els.windNote.textContent = "Hướng " + huongGio[viTriGio];

    // 3. Chỉ số UV
    els.uvValue.textContent = Math.round(weather.current.uvIndex);
    if (weather.current.uvIndex <= 2) els.uvNote.textContent = "Thấp";
    else if (weather.current.uvIndex <= 5) els.uvNote.textContent = "Trung bình";
    else if (weather.current.uvIndex <= 7) els.uvNote.textContent = "Cao";
    else els.uvNote.textContent = "Rất cao";

    // 4. Tầm nhìn
    els.visibilityValue.innerHTML = `${Math.round(weather.current.visibility)} <small>km</small>`;
    if (weather.current.visibility >= 10) els.visibilityNote.textContent = "Rất trong";
    else if (weather.current.visibility >= 5) els.visibilityNote.textContent = "Trong";
    else els.visibilityNote.textContent = "Hơi mờ";

  } catch (error) {
    console.error("Lỗi getData:", error);
    alert("Không tìm thấy thành phố hoặc có lỗi xảy ra!");
  }
}

// ============================================================
// 4. BẮT SỰ KIỆN TÌM KIẾM
// ============================================================
document.querySelector("#search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  getData();
});

// Tự động load thời tiết Hà Nội khi mới vào trang
window.addEventListener("DOMContentLoaded", () => {
  els.searchInput.value = "Hà Nội";
  getData();
});