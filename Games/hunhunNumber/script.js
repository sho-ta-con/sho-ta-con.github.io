const GRID_SIZE = 3;
const MAX_ATTEMPTS = 6;
let currentAttempt = 0;
let currentGuess = "";
let isGameOver = false;

// 日付シードの正解生成
function getDailyAnswer() {
    const now = new Date();
    const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    const random = (s) => {
        const x = Math.sin(s) * 10000;
        return x - Math.floor(x);
    };
    let nums = [0,1,2,3,4,5,6,7,8,9];
    let answer = [];
    let s = seed;
    for (let i = 0; i < GRID_SIZE; i++) {
        const r = random(s++);
        const idx = Math.floor(r * nums.length);
        answer.push(nums.splice(idx, 1)[0].toString());
    }
    return answer;
}

const targetAnswer = getDailyAnswer();

// 初期化
function initGame() {
    const grid = document.getElementById("grid");
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const row = document.createElement("div");
        row.className = "row";
        for (let j = 0; j < GRID_SIZE; j++) {
            const tile = document.createElement("div");
            tile.className = "tile";
            tile.id = `tile-${i}-${j}`;
            row.appendChild(tile);
        }
        grid.appendChild(row);
    }
    loadProgress();
}

// 入力処理
function handleInput(key) {
    if (isGameOver) return;

    if (key === "Enter") {
        submitGuess();
    } else if (key === "Backspace") {
        currentGuess = currentGuess.slice(0, -1);
        updateGrid();
    } else if (/^\d$/.test(key)) {
        // 重複なしヌメロンルール
        if (currentGuess.length < GRID_SIZE && !currentGuess.includes(key)) {
            currentGuess += key;
            updateGrid();
        }
    }
}

function updateGrid() {
    for (let i = 0; i < GRID_SIZE; i++) {
        const tile = document.getElementById(`tile-${currentAttempt}-${i}`);
        tile.textContent = currentGuess[i] || "";
        tile.setAttribute("data-state", currentGuess[i] ? "active" : "");
    }
}

async function submitGuess() {
    if (currentGuess.length !== GRID_SIZE) return;

    const guessArr = currentGuess.split("");
    const results = guessArr.map((num, i) => {
        if (num === targetAnswer[i]) return "correct";
        if (targetAnswer.includes(num)) return "present";
        return "absent";
    });

    const rowIdx = currentAttempt;
    isGameOver = true; 

    // 1文字ずつ色を変える演出
    for (let i = 0; i < GRID_SIZE; i++) {
        const tile = document.getElementById(`tile-${rowIdx}-${i}`);
        tile.classList.add(results[i]);
        updateKeyboard(guessArr[i], results[i]);
        await new Promise(r => setTimeout(r, 200));
    }

    saveMove(currentGuess);

    if (currentGuess === targetAnswer.join("")) {
        endGame(true);
    } else if (currentAttempt >= MAX_ATTEMPTS - 1) {
        endGame(false);
    } else {
        currentAttempt++;
        currentGuess = "";
        isGameOver = false;
    }
}

function updateKeyboard(num, status) {
    const keyBtn = document.querySelector(`.key[data-key="${num}"]`);
    if (keyBtn.classList.contains("correct")) return;
    if (keyBtn.classList.contains("present") && status === "absent") return;
    keyBtn.classList.remove("present", "absent");
    keyBtn.classList.add(status);
}

function endGame(win) {
    isGameOver = true;
    updateStats(win);
    setTimeout(() => showModal(), 800);
}

// 統計処理
function updateStats(win) {
    let stats = JSON.parse(localStorage.getItem("num_stats")) || {played:0, wins:0, maxStreak:0, curStreak:0};
    stats.played++;
    if (win) {
        stats.wins++;
        stats.curStreak++;
        if (stats.curStreak > stats.maxStreak) stats.maxStreak = stats.curStreak;
    } else {
        stats.curStreak = 0;
    }
    localStorage.setItem("num_stats", JSON.stringify(stats));
}

function showModal() {
    const stats = JSON.parse(localStorage.getItem("num_stats"));
    if(!stats) return;
    document.getElementById("stat-played").textContent = stats.played;
    document.getElementById("stat-wins").textContent = stats.wins;
    document.getElementById("stat-winrate").textContent = Math.round((stats.wins / stats.played) * 100) || 0;
    document.getElementById("stat-streak").textContent = stats.maxStreak;
    document.getElementById("modal").style.display = "flex";
}

function saveMove(guess) {
    let history = JSON.parse(localStorage.getItem("num_history")) || [];
    history.push(guess);
    localStorage.setItem("num_history", JSON.stringify(history));
    localStorage.setItem("num_last_date", new Date().toDateString());
}

function loadProgress() {
    const lastDate = localStorage.getItem("num_last_date");
    if (lastDate === new Date().toDateString()) {
        const history = JSON.parse(localStorage.getItem("num_history"));
        if (!history) return;
        
        history.forEach(guess => {
            const guessArr = guess.split("");
            const results = guessArr.map((num, i) => {
                if (num === targetAnswer[i]) return "correct";
                if (targetAnswer.includes(num)) return "present";
                return "absent";
            });
            for (let i = 0; i < GRID_SIZE; i++) {
                const tile = document.getElementById(`tile-${currentAttempt}-${i}`);
                tile.textContent = guess[i];
                tile.classList.add(results[i]);
                updateKeyboard(guess[i], results[i]);
            }
            if (guess === targetAnswer.join("")) {
                isGameOver = true;
                showModal();
            }
            currentAttempt++;
        });
        currentGuess = "";
    }
}

// シェア機能
document.getElementById("share-btn").onclick = () => {
    const history = JSON.parse(localStorage.getItem("num_history"));
    const dateStr = new Date().toLocaleDateString();
    let shareText = `ふんふんなんばー ${dateStr}\n${history.length}/${MAX_ATTEMPTS}\n\n`;
    
    history.forEach(guess => {
        guess.split("").forEach((num, i) => {
            if (num === targetAnswer[i]) shareText += "🟩";
            else if (targetAnswer.includes(num)) shareText += "🟨";
            else shareText += "⬛";
        });
        shareText += "\n";
    });
    shareText += "\n" + window.location.href;
    
    navigator.clipboard.writeText(shareText).then(() => {
        document.getElementById("message").textContent = "コピーしました！";
    });
};

// リスナー登録
window.addEventListener("keydown", (e) => handleInput(e.key));
document.querySelectorAll(".key").forEach(btn => {
    btn.onclick = () => handleInput(btn.getAttribute("data-key"));
});

// script.js の最後の方（リスナー登録付近）に追加
document.getElementById("modal-close").onclick = () => {
    document.getElementById("modal").style.display = "none";
};

// オプション：背景（黒い部分）をクリックしても閉じられるようにする場合
window.onclick = (event) => {
    const modal = document.getElementById("modal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

initGame();