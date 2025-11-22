// 전역 변수 설정
let isTracking = false;
let timerInterval = null;
let currentTask = { name: '', startTime: 0, color: '' };
let lastColor = null;

// 파스텔 컬러 팔레트 (확장 + 더 예쁜 톤)
const PASTEL_COLORS = [
    '#a2e8c2', // 연녹
    '#ffdb99', // 크림 오렌지
    '#a3c1e7', // 연하늘
    '#f2a9d8', // 핑크
    '#c4a8f0', // 연보라
    '#ffe4e1', // 살구
    '#c6f3e8', // 민트
    '#fde2f3', // 라일락 핑크
];

// 랜덤 파스텔 색 + 이전과 중복 방지
function getRandomPastelColor(prev) {
    let color;
    do {
        color = PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
    } while (color === prev);
    return color;
}

// 그리드 시간 설정
const START_HOUR = 6;
const END_HOUR = 2;
const TOTAL_HOURS = 21;
const MINUTES_PER_CELL = 10;

// DOM 요소 캐시
const startButton = document.getElementById('start-button');
const taskInput = document.getElementById('task-name');
const timeElapsedSpan = document.getElementById('time-elapsed');
const timeGridBody = document.getElementById('time-grid-body');

// ----------------------------------------------------
// 상태 저장 및 복구
// ----------------------------------------------------
function saveActiveTask() {
    if (isTracking) {
        localStorage.setItem('activeTask', JSON.stringify(currentTask));
    } else {
        localStorage.removeItem('activeTask');
    }
}

// ----------------------------------------------------
// 그리드 생성
// ----------------------------------------------------
function createGridRows() {
    timeGridBody.innerHTML = '';
    for (let h = START_HOUR; h <= START_HOUR + TOTAL_HOURS; h++) {
        const actualHour = h % 24;
        if (h > 24 && actualHour > END_HOUR && actualHour < START_HOUR) break;

        const row = document.createElement('tr');

        const hourHeader = document.createElement('th');
        hourHeader.className = 'time-header';
        hourHeader.textContent = actualHour;
        row.appendChild(hourHeader);

        for (let m = 0; m < 60; m += MINUTES_PER_CELL) {
            const cell = document.createElement('td');
            cell.id = `cell-${actualHour}-${m}`;
            row.appendChild(cell);
        }
        timeGridBody.appendChild(row);
    }
}

function formatTime(totalSeconds) {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - currentTask.startTime) / 1000);
    timeElapsedSpan.textContent = formatTime(elapsed);
}

function handleStartStop() {
    if (!isTracking) {
        // START
        const taskName = taskInput.value.trim();
        if (taskName === '') {
            alert("지금 하는 일을 입력해주세요.");
            return;
        }

        isTracking = true;
        currentTask.name = taskName;
        currentTask.startTime = Date.now();
        currentTask.color = getRandomPastelColor(lastColor);  // ★ 랜덤 색
        lastColor = currentTask.color;

        startButton.textContent = 'COMPLETE';
        startButton.classList.add('stop-state');
        taskInput.disabled = true;

        timerInterval = setInterval(updateTimer, 1000);
        saveActiveTask();
    } else {
        // COMPLETE
        isTracking = false;
        clearInterval(timerInterval);

        const endTime = Date.now();
        const newRecord = {
            name: currentTask.name,
            color: currentTask.color,
            startTime: currentTask.startTime,
            endTime: endTime
        };

        addRecord(newRecord);

        startButton.textContent = 'START';
        startButton.classList.remove('stop-state');
        taskInput.value = '';
        taskInput.disabled = false;
        timeElapsedSpan.textContent = '00:00:00';

        saveActiveTask();
        currentTask = { name: '', startTime: 0, color: '' };
    }
}

// ----------------------------------------------------
// LocalStorage + Grid 렌더링
// ----------------------------------------------------
function saveRecordsToLocal(records) {
    localStorage.setItem('timeTrackerRecordsGrid', JSON.stringify(records));
}

function getRecordsFromLocal() {
    const recordsJson = localStorage.getItem('timeTrackerRecordsGrid');
    return recordsJson ? JSON.parse(recordsJson) : [];
}

function addRecord(record) {
    const records = getRecordsFromLocal();
    records.push(record);
    saveRecordsToLocal(records);
    renderGrid(records);
}

function renderGrid(records) {
    document.querySelectorAll('#time-grid-body td').forEach(cell => {
        cell.className = '';
        cell.style.backgroundColor = '';
        cell.innerHTML = '';
    });

    records.forEach(record => {
        const start = new Date(record.startTime);
        const end = new Date(record.endTime);

        const startMinute = Math.ceil(start.getMinutes() / MINUTES_PER_CELL) * MINUTES_PER_CELL;
        const endMinute = Math.floor(end.getMinutes() / MINUTES_PER_CELL) * MINUTES_PER_CELL;

        let current = new Date(start);
        current.setMinutes(startMinute);
        current.setSeconds(0);
        current.setMilliseconds(0);

        while (current.getTime() < end.getTime()) {
            const hour = current.getHours();
            const minute = current.getMinutes();
            const cell = document.getElementById(`cell-${hour}-${minute}`);

            if (cell) {
                cell.className = 'filled-cell';
                cell.style.backgroundColor = record.color;

                if (current.getTime() === new Date(start).setMinutes(startMinute, 0, 0)) {
                    cell.innerHTML = `<span class="cell-label">${record.name}</span>`;
                    cell.title = `${record.name} (${new Date(record.startTime).toLocaleTimeString()} ~ ${new Date(record.endTime).toLocaleTimeString()})`;
                }
            }

            current.setMinutes(minute + MINUTES_PER_CELL);
            if (current.getHours() > END_HOUR && current.getHours() < START_HOUR) break;
        }
    });
}

function resetAllRecords() {
    if (confirm("정말로 모든 기록을 삭제하시겠습니까?")) {
        localStorage.removeItem('timeTrackerRecordsGrid');
        localStorage.removeItem('activeTask');
        renderGrid([]);
        alert("모든 기록이 초기화되었습니다.");
    }
}

// ----------------------------------------------------
// 초기 로드 + 진행 중 작업 복구
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    createGridRows();
    renderGrid(getRecordsFromLocal());

    const activeTaskJson = localStorage.getItem('activeTask');
    if (activeTaskJson) {
        const storedTask = JSON.parse(activeTaskJson);

        currentTask = storedTask;
        isTracking = true;
        taskInput.value = currentTask.name;
        taskInput.disabled = true;
        startButton.textContent = 'COMPLETE';
        startButton.classList.add('stop-state');

        timerInterval = setInterval(updateTimer, 1000);
    }
});
