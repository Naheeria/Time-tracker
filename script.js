// ----------------------------------------------------
// 🌸 전역 변수
// ----------------------------------------------------
let isTracking = false;
let timerInterval = null;
let currentTask = { name: '', startTime: 0, color: '' };
let lastColor = null;
let donutChart = null; // ✨ Chart.js 인스턴스를 저장할 변수

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

// ----------------------------------------------------
// 🌸 DOM 캐싱 (✨ 그래프 및 리스트 요소 추가)
// ----------------------------------------------------
const startButton = document.getElementById("start-button");
const taskInput = document.getElementById("task-name");
const timeElapsedSpan = document.getElementById("time-elapsed");
const timeGridBody = document.getElementById("time-grid-body");

// 새로 추가된 DOM 요소
const summaryButton = document.getElementById('summary-button');
const backButton = document.getElementById('back-button');
const mainView = document.getElementById('main-view');
const summaryView = document.getElementById('summary-view');

// ✨ 요약 화면 상세 요소 캐싱
const totalHoursEl = document.getElementById('total-hours'); // 총합 시간 표시
const taskListEl = document.getElementById('task-list');     // 상세 리스트 컨테이너
const legendEl = document.getElementById('legend');         // 그래프 범례 컨테이너
const donutCanvas = document.getElementById('donut');       // Chart.js 캔버스

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
        const MINUTES_PER_CELL = 10;

        // 10분 단위 반올림
        const startMin = Math.ceil(start.getMinutes() / MINUTES_PER_CELL) * MINUTES_PER_CELL;

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
                    cell.title = `${record.name}\n${start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} ~ ${end.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
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
// 🌸 요약 화면 기능 (✨ 상세 리스트 및 그래프 로직)
// ----------------------------------------------------
function renderSummary() {
    const records = getRecordsFromLocal();
    const summary = {};
    let totalMinutes = 0;

    // 1. 데이터 집계
    records.forEach(r => {
        // 기록이 5분 미만인 경우 제외 (노이즈 방지)
        const durationMins = Math.floor((r.endTime - r.startTime) / 60000); 
        if (durationMins < 5) return;
        
        summary[r.name] = summary[r.name] || { minutes: 0, color: r.color, records: [] };
        summary[r.name].minutes += durationMins;
        summary[r.name].records.push(r);
        totalMinutes += durationMins;
    });

    // 2. 총합 렌더링
    const totalH = Math.floor(totalMinutes / 60);
    const totalM = totalMinutes % 60;
    totalHoursEl.textContent = `총 작업 ${totalH > 0 ? totalH + '시간 ' : ''}${totalM}분`;

    // 3. 상세 태스크 리스트 및 범례 렌더링
    taskListEl.innerHTML = '';
    legendEl.innerHTML = '';
    
    // 그래프 데이터 준비
    const chartLabels = [];
    const chartData = [];
    const chartColors = [];

    Object.entries(summary).forEach(([name, data]) => {
        const mins = data.minutes;
        const h = Math.floor(mins / 60);
        const m = mins % 60;

        // 리스트 항목 생성 (가장 최근 기록의 시간대 사용)
        const latestRecord = data.records.reduce((latest, current) => current.startTime > latest.startTime ? current : latest);
        const start = new Date(latestRecord.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
        const end = new Date(latestRecord.endTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
        
        const item = document.createElement('div');
        item.className = 'task';
        item.innerHTML = `
            <div>
                <strong>${name}</strong>
                <div class="small">${start.replace(':', '')} ~ ${end.replace(':', '')} (총 ${h > 0 ? h + 'h ' : ''}${m}m)</div>
            </div>
            <div class="badge" style="background:${data.color}">${h > 0 ? h + 'h' : m + 'm'}</div>
        `;
        taskListEl.appendChild(item);

        // 그래프 데이터 채우기
        chartLabels.push(name);
        chartData.push(mins);
        chartColors.push(data.color);
        
        // 범례 항목 생성
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `<span class="swatch" style="background:${data.color}"></span> ${name} <strong style="margin-left:4px;color:#3a4b66">${h > 0 ? h + 'h ' : ''}${m}m</strong>`;
        legendEl.appendChild(legendItem);
    });

    // 4. 그래프 렌더링 (Chart.js)
    if (donutChart) {
        donutChart.destroy(); // 기존 차트가 있으면 제거
    }
    
    if (chartData.length > 0) {
        donutCanvas.style.display = 'block';
        const ctx = donutCanvas.getContext('2d');
        // Chart 객체가 전역에 로드되어 있다고 가정
        donutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: chartData,
                    backgroundColor: chartColors,
                    borderColor: '#fff',
                    borderWidth: 2,
                }]
            },
            options: {
                cutout: '60%',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const min = ctx.raw;
                                const h = Math.floor(min / 60);
                                const m = min % 60;
                                return `${ctx.label}: ${h > 0 ? h + 'h ' : ''}${m}m`;
                            }
                        }
                    }
                }
            }
        });
    } else {
        // 데이터가 없을 때 캔버스 숨김 및 메시지 표시
        donutCanvas.style.display = 'none';
        legendEl.innerHTML = '<div style="text-align:center;color:#6f7c8f;padding:20px 0;">기록된 작업이 5분 이상 없습니다.</div>';
    }
}

// ----------------------------------------------------
// 🌸 이벤트 리스너 및 초기 로드
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // 1. 초기 Grid 및 Active Task 로드 
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
    
    // 2. 이벤트 리스너 연결 
    document.getElementById("reset-button").onclick = resetAllRecords;
    startButton.onclick = handleStartStop;

    // ✨ 화면 토글 이벤트 연결
    if (summaryButton && mainView && summaryView) {
        summaryButton.onclick = () => {
            mainView.style.display = 'none';
            summaryView.style.display = 'block';
            renderSummary(); // 요약 데이터를 렌더링
        };
    }
    
    if (backButton && mainView && summaryView) {
        backButton.onclick = () => {
            summaryView.style.display = 'none';
            mainView.style.display = 'block';
            // 메모리 누수 방지를 위해 차트 인스턴스 해제
            if(donutChart) {
                donutChart.destroy(); 
                donutChart = null;
            }
        };
    }
});
