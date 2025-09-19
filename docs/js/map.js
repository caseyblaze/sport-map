// 初始化地圖（台北市中心）
const map = L.map('map').setView([25.0478, 121.5319], 15);

// 使用 CartoDB Voyager 圖磚（接近 Google Maps 風格）
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap, © CartoDB'
}).addTo(map);

// 地點 marker 用 Leaflet 預設藍色圖標
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
});

// 定位 marker
const userLocationIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
});

// 定義不同類型的 marker 圖標
const iconMap = {
    '羽球場': L.icon({
        iconUrl: 'images/sports_badminton.svg',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    }),
    '籃球場': L.icon({
        iconUrl: 'images/sports_basketball.svg',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    }),
    '排球場': L.icon({
        iconUrl: 'images/sports_volleyball.svg',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    }),
    '游泳池': L.icon({
        iconUrl: 'images/sports_swimming.svg',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    }),
    '足球場': L.icon({
        iconUrl: 'images/sports_soccer.svg',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    }),
    '田徑/跑道': L.icon({
        iconUrl: 'images/sports_track.svg',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    }),
    '活動中心/多功能空間': L.icon({
        iconUrl: 'images/sports_activity_center.svg',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    }),
    '高爾夫球場': L.icon({
        iconUrl: 'images/sports_golf.svg',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    }),
    '綜合/多功能場館': L.icon({
        iconUrl: 'images/sports_multi_sport.svg',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    }),
    '桌球場': L.icon({
        iconUrl: 'images/sports_table_tennis.svg',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    }),
    '健身房': L.icon({
        iconUrl: 'images/sports_gym.svg',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    }),
    '網球場': L.icon({
        iconUrl: 'images/sports_tennis.svg',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    }),
    '體操室': L.icon({
        iconUrl: 'images/sports_gymnastics.svg',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    }),
    '滾球/槌球場': L.icon({
        iconUrl: 'images/sports_croquet.svg',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    }),
    '棒壘球場': L.icon({
        iconUrl: 'images/sports_baseball.svg',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    }),
    '舞蹈教室': L.icon({
        iconUrl: 'images/sports_dance.svg',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    }),
    '滑輪場': L.icon({
        iconUrl: 'images/sports_roller.svg',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    }),
    '橄欖球場': L.icon({
        iconUrl: 'images/sports_rugby.svg',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    }),
    '運動公園': L.icon({
        iconUrl: 'images/sports_park.svg',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    })
};

// 圖標篩選器功能（下拉選單，只顯示一個框）
const filterOptions = document.getElementById('filter-options');
const allTypes = Object.keys(iconMap);
let selectedType = null; // null 代表全部
let markers = [];
let openPopupData = null; // 記錄當前打開的 popup 資訊

function renderFilterBar() {
    filterOptions.innerHTML = '';
    const select = document.createElement('select');
    select.style.fontSize = '15px';
    select.style.padding = '4px 8px';
    // "全部"選項
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = '全部';
    select.appendChild(allOption);
    // 其他類型
    allTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        select.appendChild(option);
    });
    select.value = selectedType || '';
    select.addEventListener('change', (e) => {
        selectedType = e.target.value || null;
        updateMarkers();
    });
    filterOptions.appendChild(select);
}
renderFilterBar();

// 地區搜尋功能
const locationSearch = document.getElementById('location-search');
const searchBtn = document.getElementById('search-btn');

function searchLocation() {
    const query = locationSearch.value.trim();
    if (!query) return;

    // 使用 Nominatim API 搜尋地址
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' 台灣')}&limit=1`;

    fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lng = parseFloat(result.lon);

                // 移動地圖到搜尋結果
                map.setView([lat, lng], 14);

                // 可選：在搜尋位置放一個臨時 marker
                const searchMarker = L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup(`搜尋結果: ${result.display_name}`)
                    .openPopup();

                // 5秒後移除搜尋 marker
                setTimeout(() => {
                    map.removeLayer(searchMarker);
                }, 5000);
            } else {
                alert('找不到該地區，請嘗試其他關鍵字');
            }
        })
        .catch(error => {
            console.error('搜尋錯誤:', error);
            alert('搜尋失敗，請稍後再試');
        });
}

// 綁定搜尋按鈕點擊事件
searchBtn.addEventListener('click', searchLocation);

// 綁定 Enter 鍵搜尋
locationSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchLocation();
    }
});

// 載入並解析 CSV，僅顯示地圖附近的點位
fetch('data/taiwan_locations.csv')
    .then(response => response.text())
    .then(csvText => {
        const lines = csvText.trim().split('\n');
        // 先全部解析成物件陣列
        const headers = lines[0].split(',');
        const allLocations = [];
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',');
            const name = row[2];
            const lat = parseFloat(row[5]);
            const lng = parseFloat(row[6]);
            if (name && !isNaN(lat) && !isNaN(lng)) {
                allLocations.push({
                    name,
                    phone: row[3],
                    address: row[4],
                    lat,
                    lng,
                    opening_hours: row[7],
                    rental_info: row[8],
                    description: row[9],
                    category: row[1]
                });
            }
        }
        // 只顯示地圖目前視窗範圍內的點位
        function updateMarkers() {
            // 檢查是否有打開的 popup
            const currentPopup = map._popup;
            if (currentPopup && currentPopup.isOpen()) {
                const popupLatLng = currentPopup.getLatLng();
                openPopupData = {
                    lat: popupLatLng.lat,
                    lng: popupLatLng.lng,
                    content: currentPopup.getContent()
                };
            }

            // 移除舊的 marker
            markers.forEach(m => map.removeLayer(m));
            markers = [];
            const bounds = map.getBounds();
            allLocations.forEach(loc => {
                const typeMatch = selectedType === null || loc.category === selectedType;
                if (bounds.contains([loc.lat, loc.lng]) && typeMatch) {
                    const gmapUrl = `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;
                    const popupHtml = `
                        <b>${loc.name}</b><br>
                        <b>場地類型：</b>${loc.category || ''}<br>
                        <b>地址：</b>${loc.address || ''}<br>
                        <b>電話：</b>${loc.phone || ''}<br>
                        <b>開放時間：</b>${loc.opening_hours || ''}<br>
                        <b>場地租借：</b>${loc.rental_info || ''}<br>
                        <b>簡介：</b>${loc.description || ''}<br>
                        <a href='${gmapUrl}' target='_blank'>在 Google 地圖開啟</a>
                    `;
                    // 根據類型選擇 icon，沒有就用預設
                    const icon = iconMap[loc.category] || defaultIcon;
                    const marker = L.marker([loc.lat, loc.lng], { icon })
                        .addTo(map)
                        .bindPopup(popupHtml);

                    // 如果這個 marker 之前有打開的 popup，重新打開它
                    if (openPopupData &&
                        Math.abs(openPopupData.lat - loc.lat) < 0.0001 &&
                        Math.abs(openPopupData.lng - loc.lng) < 0.0001) {
                        marker.openPopup();
                        openPopupData = null; // 清除記錄
                    }

                    markers.push(marker);
                }
            });
        }
        // 初次載入
        updateMarkers();
        // 當地圖移動或縮放時，重新載入附近點位
        map.on('moveend', updateMarkers);
        // 讓篩選器切換時也能更新
        window.updateMarkers = updateMarkers;
    })
    .catch(error => console.error('Error loading the CSV file:', error));

// 定位按鈕功能
const locateBtn = document.getElementById('locate-btn');
let userLocationMarker = null;

if (locateBtn) {
    locateBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    map.setView([lat, lng], 16);
                    // 移除舊的定位 marker
                    if (userLocationMarker) {
                        map.removeLayer(userLocationMarker);
                    }
                    userLocationMarker = L.marker([lat, lng], { icon: userLocationIcon })
                        .addTo(map)
                        .bindPopup('你的位置')
                        .openPopup();
                },
                () => {
                    alert('無法取得定位資訊');
                }
            );
        } else {
            alert('瀏覽器不支援定位功能');
        }
    });
}