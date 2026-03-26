// 初始化地圖（台北市中心）
const map = L.map('map').setView([25.0478, 121.5319], 15);

// 使用 CartoDB Voyager 圖磚（接近 Google Maps 風格）
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap, © CartoDB'
}).addTo(map);

const MIN_MARKER_ZOOM = 13;

// Define a reusable function to create icons without shadows
function createIcon(iconUrl) {
    return L.icon({
        iconUrl: iconUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    });
}

// Configuration array for marker types and their corresponding icons
const markerConfig = [
    { type: '羽球場', icon: 'images/badminton.svg' },
    { type: '籃球場', icon: 'images/basketball.svg' },
    { type: '排球場', icon: 'images/volleyball.svg' },
    { type: '游泳池', icon: 'images/swimming.svg' },
    { type: '足球場', icon: 'images/soccer.svg' },
    { type: '田徑/跑道', icon: 'images/track.svg' },
    { type: '活動中心/多功能空間', icon: 'images/activity_center.svg' },
    { type: '高爾夫球場', icon: 'images/golf.svg' },
    { type: '綜合/多功能場館', icon: 'images/activity_center.svg' },
    { type: '桌球場', icon: 'images/table_tennis.svg' },
    { type: '健身房', icon: 'images/gym.svg' },
    { type: '網球場', icon: 'images/tennis.svg' },
    { type: '體操室', icon: 'images/park.svg' },
    { type: '滾球/槌球場', icon: 'images/croquet.svg' },
    { type: '棒壘球場', icon: 'images/baseball.svg' },
    { type: '舞蹈教室', icon: 'images/park.svg' },
    { type: '滑輪場', icon: 'images/roller.svg' },
    { type: '橄欖球場', icon: 'images/rugby.svg' },
    { type: '運動公園', icon: 'images/park.svg' }
];

// Dynamically generate the iconMap object
const iconMap = {};
markerConfig.forEach(config => {
    iconMap[config.type] = createIcon(config.icon);
});

// Lazy-load marker icons (if applicable)
// Note: This requires additional setup, such as using a library like "lazysizes" or implementing custom logic to load icons only when needed.
// For now, ensure icons are optimized and served from a CDN or compressed format.

// 定位 marker
const userLocationIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

// 地點 marker 用 Leaflet 預設藍色圖標
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

// 圖標篩選器功能（下拉選單，只顯示一個框）
const filterOptions = document.getElementById('filter-options');
const allTypes = Object.keys(iconMap);
let selectedType = null; // null 代表全部
const clusterGroup = L.markerClusterGroup({
    showCoverageOnHover: false,
    removeOutsideVisibleBounds: true,
    chunkedLoading: true,
    chunkDelay: 25,
    chunkInterval: 200
});
clusterGroup.addTo(map);

let markerEntries = [];
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
        markerEntries = allLocations.map(loc => {
            const gmapUrl = `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;
            const popupHtml = `
                <b>${loc.name}</b><br>
                <b>場地類型：</b>${loc.category || ''}<br>
                <b>地址：</b>${loc.address || ''}<br>
                <b>電話：</b>${loc.phone || ''}<br>
                <b>開放時間：</b>${loc.opening_hours || ''}<br>
                <b>場地租借：</b>${loc.rental_info || ''}<br>
                <b>簡介：</b>${loc.description || ''}<br>
                <a href='${gmapUrl}' target='_blank' rel='noopener noreferrer'>在 Google 地圖開啟</a>
            `;
            const icon = iconMap[loc.category] || defaultIcon;
            const marker = L.marker([loc.lat, loc.lng], { icon }).bindPopup(popupHtml);
            return { loc, marker };
        });

        // 只顯示地圖目前視窗範圍內的點位
        function updateMarkers() {
            const zoom = map.getZoom();
            if (zoom < MIN_MARKER_ZOOM) {
                clusterGroup.clearLayers();
                openPopupData = null;
                return;
            }

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

            const bounds = map.getBounds();
            const nextMarkers = [];
            let reopenMarker = null;

            markerEntries.forEach(entry => {
                const loc = entry.loc;
                const typeMatch = selectedType === null || loc.category === selectedType;
                if (bounds.contains([loc.lat, loc.lng]) && typeMatch) {
                    nextMarkers.push(entry.marker);

                    if (openPopupData &&
                        Math.abs(openPopupData.lat - loc.lat) < 0.0001 &&
                        Math.abs(openPopupData.lng - loc.lng) < 0.0001) {
                        reopenMarker = entry.marker;
                    }
                }
            });

            clusterGroup.clearLayers();
            if (nextMarkers.length > 0) {
                clusterGroup.addLayers(nextMarkers);
            }

            if (reopenMarker) {
                clusterGroup.zoomToShowLayer(reopenMarker, () => {
                    reopenMarker.openPopup();
                });
                openPopupData = null;
            }
        }
        // 初次載入
        updateMarkers();
        // 當地圖移動或縮放時，重新載入附近點位
        // Debounce function to limit the frequency of updateMarkers calls
        function debounce(func, wait) {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        }

        // Wrap updateMarkers with debounce to improve performance
        const debouncedUpdateMarkers = debounce(updateMarkers, 200);

        // Replace event listeners with debounced version
        map.on('moveend', debouncedUpdateMarkers);
        window.updateMarkers = debouncedUpdateMarkers;
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