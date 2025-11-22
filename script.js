// ----------------------------------------------------
// 🌸 전역 변수
// ----------------------------------------------------
let isTracking = false;
let timerInterval = null;
let currentTask = { name: '', startTime: 0, color: '' };
let lastColor = null;

// ----------------------------------------------------
// 🌸 파스텔 팔레트 (랜덤 + 이전 중복 금지)
// ----------------------------------------------------
const PASTEL_COLORS = [
    "#a2e8c2", // 연녹
    "#ffdb99", // 크림 오렌지
    "#a3c1e7", // 연하늘
    "#f2a9d8", // 핑크
    "#c4a8f0", // 연보라
    "#ffe4e1", // 살구
    "#c6f3e8", // 민트
    "#fde2f3"  // 라일락 핑크
];

function getRandomPastelColor(prev) {
    let color;
    do {
        color = PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
    } while (color === prev);
    return color;
}

// ----------------------------------------------------
// 🌸 시간 설정 (옵션 A)
// ----------------------------------------------------
const START_HOUR = 8;    // 08:00 시작
const END_HOUR = 23;     // 23:50까지
const MINUTES_PER_CELL = 10;

// DOM 캐싱 (추가 버튼 포함)
const startButton = document.getElementById("start-button");
const taskInput = document.getElementById("task-name");
const timeElapsedSpan = document.getElementById("time-elapsed");
const timeGridBody = document.getElementById("time-grid-body");
// 새로 추가된 DOM 요소
const summaryButton = document.getElementById('summary-button');
const backButton = document.getElementById('back-button');
const mainView = document.getElementById('main-view');
const summaryView = document.getElementById('summary-view');

// ----------------------------------------------------
// 🌸 ACTIVE 상태 저장
// ----------------------------------------------------
function saveActiveTask() {
    if (isTracking) {
        localStorage.setItem("activeTask", JSON.stringify(currentTask));
    } else {
        localStorage.removeItem("activeTask");
    }
}

// ----------------------------------------------------
// 🌸 Grid 생성 (08:00 ~ 23:50)
// ----------------------------------------------------
function createGridRows() {
    timeGridBody.innerHTML = "";

    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
        const row = document.createElement("tr");

        // 시(th) 헤더
        const th = document.createElement("th");
        th.className = "time-header";
        th.textContent = hour;
        row.appendChild(th);

        // 10분 간격 셀 6개
        for (let min = 0; min < 60; min += MINUTES_PER_CELL) {
            const td = document.createElement("td");
            td.id = `cell-${hour}-${min}`;
            row.appendChild(td);
        }

        timeGridBody.appendChild(row);
    }
}

// ----------------------------------------------------
// ⏱ 타이머
// ----------------------------------------------------
function formatTime(totalSeconds) {
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - currentTask.startTime) / 1000);
    timeElapsedSpan.textContent = formatTime(elapsed);
}

// ----------------------------------------------------
// 🌸 START / COMPLETE 버튼
// ----------------------------------------------------
function handleStartStop() {
    if (!isTracking) {
        // START
        const name = taskInput.value.trim();
        if (name === "") {
            alert("지금 하는 일을 입력해주세요!");
            return;
        }

        isTracking = true;

        currentTask.name = name;
        currentTask.startTime = Date.now();
        currentTask.color = getRandomPastelColor(lastColor);
        lastColor = currentTask.color;

        taskInput.disabled = true;
        startButton.textContent = "COMPLETE";
        startButton.classList.add("stop-state");

        timerInterval = setInterval(updateTimer, 1000);
        saveActiveTask();

    } else {
        // COMPLETE
        isTracking = false;
        clearInterval(timerInterval);

        const endTime = Date.now();
        const record = {
            name: currentTask.name,
            color: currentTask.color,
            startTime: currentTask.startTime,
            endTime: endTime
        };

        addRecord(record);

        // UI 초기화
        startButton.textContent = "START";
        startButton.classList.remove("stop-state");
        taskInput.disabled = false;
        taskInput.value = "";
        timeElapsedSpan.textContent = "00:00:00";

        // state 리셋
        currentTask = { name: "", startTime: 0, color: "" };
        saveActiveTask();
    }
}

// ----------------------------------------------------
// 🌸 LocalStorage 저장/로드
// ----------------------------------------------------
function saveRecordsToLocal(records) {
    localStorage.setItem("timeTrackerRecordsGrid", JSON.stringify(records));
}

function getRecordsFromLocal() {
    const json = localStorage.getItem("timeTrackerRecordsGrid");
    return json ? JSON.parse(json) : [];
}

function addRecord(record) {
    const records = getRecordsFromLocal();
    records.push(record);
    saveRecordsToLocal(records);
    renderGrid(records);
}

// ----------------------------------------------------
// 🌸 Grid 렌더링
// ----------------------------------------------------
function renderGrid(records) {
    // 전체 초기화
    document.querySelectorAll("#time-grid-body td").forEach(cell => {
        cell.className = "";
        cell.style.backgroundColor = "";
        cell.innerHTML = "";
    });

    records.forEach(record => {
        const start = new Date(record.startTime);
        const end = new Date(record.endTime);

        // 10분 단위 반올림
        const startMin = Math.ceil(start.getMinutes() / MINUTES_PER_CELL) * MINUTES_PER_CELL;
        const endMin = Math.floor(end.getMinutes() / MINUTES_PER_CELL) * MINUTES_PER_CELL;

        let cur = new Date(start);
        cur.setMinutes(startMin, 0, 0);

        while (cur.getTime() < end.getTime()) {
            const h = cur.getHours();
            const m = cur.getMinutes();

            // 08~23 사이만 채움 (버그 완전 방지)
            if (h < START_HOUR || h > END_HOUR) break;

            const cell = document.getElementById(`cell-${h}-${m}`);
            if (cell) {
                cell.className = "filled-cell";
                cell.style.backgroundColor = record.color;

                // 첫 셀에 라벨 표시
                if (cur.getTime() === new Date(start).setMinutes(startMin, 0, 0)) {
                    cell.innerHTML = `<span class="cell-label">${record.name}</span>`;
                    cell.title = `${record.name}\n${start.toLocaleTimeString()} ~ ${end.toLocaleTimeString()}`;
                }
            }

            cur.setMinutes(m + MINUTES_PER_CELL);
        }
    });
}

// ----------------------------------------------------
// 🌸 기록 전체 삭제
// ----------------------------------------------------
function resetAllRecords() {
    if (confirm("모든 기록을 정말로 삭제하시겠습니까?")) {
        localStorage.removeItem("timeTrackerRecordsGrid");
        localStorage.removeItem("activeTask");
        renderGrid([]);
        alert("초기화 완료!");
    }
}

// ----------------------------------------------------
// 🌸 요약 화면 기능 (채찍이의 코드 추가)
// ----------------------------------------------------

// 기록 요약 생성
function renderSummary() {
    const records = getRecordsFromLocal();
    const summary = {};

    records.forEach(r => {
        const mins = Math.floor((r.endTime - r.startTime) / 60000);
        summary[r.name] = (summary[r.name] || 0) + mins;
    });

    const container = document.getElementById('summary-content');
    container.innerHTML = '';

    Object.entries(summary).forEach(([name, mins]) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        const div = document.createElement('div');
        div.textContent = `${name}: ${h}시간 ${m}분`;
        container.appendChild(div);
    });
}

// ----------------------------------------------------
// 🌸 이벤트 리스너 및 초기 로드
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // 1. 초기 Grid 및 Active Task 로드 (기존 로직)
    createGridRows();
    renderGrid(getRecordsFromLocal());

    const activeJson = localStorage.getItem("activeTask");
    if (activeJson) {
        const stored = JSON.parse(activeJson);
        currentTask = stored;
        isTracking = true;

        taskInput.value = stored.name;
        taskInput.disabled = true;
        startButton.textContent = "COMPLETE";
        startButton.classList.add("stop-state");

        timerInterval = setInterval(updateTimer, 1000);
    }
    
    // 2. 이벤트 리스너 연결 (새로 추가/수정)
    document.getElementById("reset-button").onclick = resetAllRecords;
    startButton.onclick = handleStartStop;

    // 두 화면 토글 (채찍이 로직)
    if (summaryButton && mainView && summaryView) {
        summaryButton.onclick = () => {
            mainView.style.display = 'none';
            summaryView.style.display = 'block';
            renderSummary();
        };
    }
    
    if (backButton && mainView && summaryView) {
        backButton.onclick = () => {
            summaryView.style.display = 'none';
            mainView.style.display = 'block';
        };
    }
});
