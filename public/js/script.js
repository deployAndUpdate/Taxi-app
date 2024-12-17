import { decodePolyline } from "./mapUtils.js";

// Инициализация карты с центром в Сумах
const map = L.map('map').setView([50.9077, 34.7981], 13);  // Сумы по умолчанию

// Добавление слоя карты (например, OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Массив для хранения маркеров
let markers = [];
let routes = [];
let startPoint = null;
let endPoint = null;
let isStartPointSelected = false;

    // Обработчик клика на карту для добавления маркеров
map.on('click', function(e) {
  if (isStartPointSelected) {
    // Если выбрана стартовая точка, то нужно выбрать конечную
    endPoint = e.latlng;
    drawRoute(startPoint, endPoint);
    isStartPointSelected = false; // Завершаем процесс выбора
    showPopup("Маршрут построен!");
  } else {
    // Если еще не выбрана стартовая точка
    startPoint = e.latlng;
    isStartPointSelected = true;  // Устанавливаем флаг, что стартовая точка выбрана
    showPopup("Теперь выберите конечную точку для маршрута.");
  }
});

// Обработчик клика на карту для добавления маркеров
map.on('click', function(e) {
  // Добавление маркера в точку клика
  const marker = L.marker(e.latlng).addTo(map);
  markers.push(marker);
  marker.bindPopup('Маркер добавлен!').openPopup();
});

// Функция для рисования маршрута между двумя точками
function drawRoute(start, end) {
  // URL для OSRM API для получения маршрута
  const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=polyline&steps=true`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const route = data.routes[0];
      const encodedPolyline = route.geometry;  // Закодированная полилиния

      // Декодируем полилинию с помощью стандартного алгоритма для polyline
      const polyline = decodePolyline(encodedPolyline);  // Декодируем полилинию
      const path = L.polyline(polyline, { color: 'blue', weight: 4 }).addTo(map);
      routes.push(path);
      map.fitBounds(path.getBounds()); // Центрируем карту по маршруту
    })
    .catch(error => console.error('Ошибка при запросе маршрута:', error));
}

function showPopup(message) {
  const popupMessage = document.getElementById('popupMessage');
  const messagePopup = document.getElementById('messagePopup');
  popupMessage.textContent = message;
  messagePopup.style.display = 'block'; // Показываем всплывающее окно
}

// Функция для скрытия всплывающего окна
function closePopup() {
  const messagePopup = document.getElementById('messagePopup');
  messagePopup.style.display = 'none'; // Скрываем всплывающее окно
}


// Функция для удаления последнего маркера
function removeLastMarker() {
  const lastMarker = markers.pop(); // Получаем последний маркер из массива
  if (lastMarker) {
    map.removeLayer(lastMarker); // Удаляем маркер с карты
  }
}

function clearRoutes() {
    debugger
    // Удаляем все полилинии с карты
    routes.forEach(route => map.removeLayer(route));
    // Очищаем массив маршрутов
    routes = [];
  }

function createRoute() {
  isStartPointSelected = false;
  startPoint = null;
  endPoint = null;
  showPopup("Выберите точку посадки.");
}

// Добавление обработчика клика на кнопку для удаления последнего маркера
document.getElementById('removeButton').addEventListener('click', removeLastMarker);
document.getElementById('clearRoutesButton').addEventListener('click', clearRoutes);
document.getElementById('createRouteButton').addEventListener('click', createRoute);
document.getElementById('closePopupButton').addEventListener('click', closePopup);

