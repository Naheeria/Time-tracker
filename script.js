/* ------------------------------
    🌸 파스텔 테마 변수 (그대로 유지)
    ------------------------------ */
:root {
    --bg: #f7fbff;
    --card: #ffffff;
    --border: #cfe7ff;

    --accent: #8abfff;
    --accent-dark: #5a9ce8;

    --text-main: #3a4b66;
    --text-light: #6f7c8f;

    --start: #b8f0ff;
    --start-hover: #a3e6ff;

    --stop: #ffd4d4;
    --stop-hover: #ffbcbc;

    --shadow: 0 6px 18px rgba(120, 160, 210, 0.15);
    --radius: 12px;
}

/* ------------------------------
    🌸 전체 스타일
    ------------------------------ */
body {
    background: var(--bg);
    font-family: "Pretendard", sans-serif;
    display: flex;
    justify-content: center;
    padding: 15px;
    color: var(--text-main);
}

/* 위젯 카드 (🔥 사이즈 축소) */
#tracker-widget.card {
    width: 250px;           /* 💛 핵심: 쁘띠 사이즈 */
    background: var(--card);
    border-radius: var(--radius);
    padding: 14px 14px;        /* 🔥 내부 여백 축소 */
    box-shadow: var(--shadow);
    border: 1.5px solid var(--border);
}

/* 제목 */
.widget-title {
    text-align: center;
    color: var(--accent-dark);
    font-size: 15px;           /* 🔥 작게 */
    margin-bottom: 12px;
    font-weight: 800;
}

/* ------------------------------
    ✨ 컨트롤 패널 (🔥 소형화)
    ------------------------------ */
#control-panel {
    display: flex;
    gap: 6px;
    margin-bottom: 10px;
}

#task-name {
    flex-grow: 1;
    padding: 6px 8px;          /* 🔥 작게 */
    font-size: 11px;           /* 🔥 작게 */
    border: 1.6px solid var(--border);
    border-radius: var(--radius);
    background: #fff;
    transition: 0.2s;
}

#task-name:focus {
    outline: none;
    border-color: var(--accent);
    background: #faf6ff;
}

/* 버튼 공통 */
button {
    padding: 6px 10px;           /* 🔥 작게 */
    font-size: 11px;
    font-weight: 700;
    border: none;
    border-radius: var(--radius);
    cursor: pointer;
    transition: 0.2s;
    white-space: nowrap;
}

/* START 버튼 */
#start-button {
    background: var(--start);
    color: var(--text-main);
}
#start-button:hover {
    background: var(--start-hover);
}

/* STOP 버튼 */
.stop-state {
    background: var(--stop) !important;
}
.stop-state:hover {
    background: var(--stop-hover) !important;
}

/* ------------------------------
    ⏱ 타이머 (🔥 소형화)
    ------------------------------ */
#timer-display {
    text-align: center;
    font-size: 20px;         /* 🔥 기존 32 → 20 */
    font-weight: 800;
    color: var(--accent-dark);
    margin-bottom: 10px;
}

/* ------------------------------
    📊 표 섹션
    ------------------------------ */
#grid-container {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: var(--radius);
    overflow: hidden;
    border: 1px solid var(--border);
}

th, td {
    border: 1px solid var(--border);
    padding: 3px 0;            /* 🔥 세로 길이 강력 축소 */
    height: 22px;              /* 🔥 기존 32 → 22 */
    text-align: center;
    font-size: 10px;           /* 🔥 테이블 폰트 축소 */
}

/* 헤더 */
thead th {
    background: #f4f0ff;
    color: var(--text-main);
    font-weight: 600;
}

/* 시 헤더 */
.time-header {
    background: var(--accent-dark) !important;
    color: white !important;
    width: 28px;               /* 🔥 좁게 */
    font-size: 10px;
}

/* 기록된 셀 */
.filled-cell {
    position: relative;
}

/* ------------------------------
    ✨ 셀 라벨 (가독성 유지)
    ------------------------------ */
.cell-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 9px;            /* 🔥 줄였지만 여전히 보임 */
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 90%;
    color: #333;
    text-shadow: 0 0 2px rgba(255,255,255,0.6);
}

/* ------------------------------
    ✨ 버튼 그룹 (초기화 + 요약)
    ------------------------------ */
#action-buttons {
    display: flex;
    gap: 8px;
    margin-top: 12px; /* 위쪽에 여백 추가 */
}

/* 기록 초기화 버튼 */
#reset-button {
    flex-grow: 1; /* 너비 균등 분할 */
    padding: 8px;
    background: #e6e6e6;
    font-size: 11px;
}
#reset-button:hover {
    background: #d6d6d6;
}

/* 오늘 요약 보기 버튼 */
#summary-button {
    flex-grow: 1; /* 너비 균등 분할 */
    padding: 8px;
    background: var(--accent);
    color: white;
    font-size: 11px;
}
#summary-button:hover {
    background: var(--accent-dark);
}

/* ------------------------------
    ✨ 요약 화면 스타일 (채찍이 반영)
    ------------------------------ */
#summary-view {
    padding: 10px;
    display: none; /* 초기에는 숨김 */
}

#summary-content div {
    padding: 6px 0;
    border-bottom: 1px solid var(--border);
    font-size: 12px;
    font-weight: 500;
}

#summary-content div:last-child {
    border-bottom: none;
}

/* 뒤로가기 버튼 (채찍이 반영) */
#back-button {
    margin-top: 20px;
    width: 100%;
    padding: 12px;
    background: #e6e6e6;
    font-size: 12px;
}
#back-button:hover {
    background: #d6d6d6;
}
