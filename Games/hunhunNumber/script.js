// ゲームの定数設定
const GRID_SIZE = 3; // 数字の桁数（3桁）
const MAX_ATTEMPTS = 6; // 最大試行回数
let currentAttempt = 0; // 現在の試行回数
let currentGuess = ""; // 現在の入力文字列
let isGameOver = false; // ゲーム終了フラグ

// 日付シードの正解生成
function getDailyAnswer() {
    // ステップ1: 現在の日付を取得する
    const now = new Date();
    
    // ステップ2: 日付をシード値に変換する（年*10000 + 月*100 + 日）
    const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    
    // ステップ3: シードを使ってランダム数を生成する関数を定義
    const random = (s) => {
        // Math.sinを使って擬似ランダム数を生成
        const x = Math.sin(s) * 10000;
        // 小数部分だけを取り出す（0-1の範囲）
        return x - Math.floor(x);
    };
    
    // ステップ4: 0から9までの数字の配列を作成
    let nums = [0,1,2,3,4,5,6,7,8,9];
    
    // ステップ5: 正解を格納する空の配列を準備
    let answer = [];
    
    // ステップ6: シードの初期値を設定
    let s = seed;
    
    // ステップ7: GRID_SIZE（3桁）分の数字をランダムに選んで重複なしで追加
    for (let i = 0; i < GRID_SIZE; i++) {
        // ランダム数を生成
        const r = random(s++);
        // 残りの数字の数で割ってインデックスを決定
        const idx = Math.floor(r * nums.length);
        // 選んだ数字をanswerに追加し、numsから削除
        answer.push(nums.splice(idx, 1)[0].toString());
    }
    
    // ステップ8: 生成した正解の配列を返す
    return answer;
}

const targetAnswer = getDailyAnswer(); // 今日の正解数字

// 初期化
function initGame() {
    // ステップ1: HTMLからグリッド要素を取得
    const grid = document.getElementById("grid");
    
    // ステップ2: 最大試行回数分の行を作成
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        // ステップ2-1: 新しい行要素を作成
        const row = document.createElement("div");
        // ステップ2-2: 行にクラス名を設定
        row.className = "row";
        
        // ステップ2-3: 各行にGRID_SIZE分のタイルを作成
        for (let j = 0; j < GRID_SIZE; j++) {
            // ステップ2-3-1: 新しいタイル要素を作成
            const tile = document.createElement("div");
            // ステップ2-3-2: タイルにクラス名を設定
            tile.className = "tile";
            // ステップ2-3-3: タイルに一意のIDを設定（行番号-列番号）
            tile.id = `tile-${i}-${j}`;
            // ステップ2-3-4: タイルを行に追加
            row.appendChild(tile);
        }
        
        // ステップ2-4: 完成した行をグリッドに追加
        grid.appendChild(row);
    }
    
    // ステップ3: 前回の進行状況を読み込んで復元
    loadProgress();
}

// 入力処理
function handleInput(key) {
    // ステップ1: ゲームが終了している場合は何もしない
    if (isGameOver) return;
    
    // ステップ2: 押されたキーに応じて処理を分岐
    if (key === "Enter") {
        // ステップ2-1: Enterキーが押されたら推測を送信
        submitGuess();
    } else if (key === "Backspace") {
        // ステップ2-2: Backspaceキーが押されたら最後の文字を削除
        currentGuess = currentGuess.slice(0, -1);
        // ステップ2-3: グリッドを更新して削除を反映
        updateGrid();
    } else if (/^\d$/.test(key)) {
        // ステップ2-4: 数字キーが押された場合
        // 重複なしヌメロンルール: 同じ数字は使えない
        if (currentGuess.length < GRID_SIZE && !currentGuess.includes(key)) {
            // ステップ2-4-1: 現在の推測に数字を追加
            currentGuess += key;
            // ステップ2-4-2: グリッドを更新して追加を反映
            updateGrid();
        }
    }
}

function updateGrid() {
    // ステップ1: 現在の行の各タイルを更新
    for (let i = 0; i < GRID_SIZE; i++) {
        // ステップ1-1: 現在の試行回数と列番号でタイル要素を取得
        const tile = document.getElementById(`tile-${currentAttempt}-${i}`);
        // ステップ1-2: タイルのテキストを現在の推測の対応する文字に設定（なければ空文字）
        tile.textContent = currentGuess[i] || "";
        // ステップ1-3: 文字がある場合はアクティブ状態に設定
        tile.setAttribute("data-state", currentGuess[i] ? "active" : "");
    }
}

async function submitGuess() {
    // ステップ1: 推測が3桁揃っていない場合は何もしない
    if (currentGuess.length !== GRID_SIZE) return;
    
    // ステップ2: 推測を文字配列に変換
    const guessArr = currentGuess.split("");
    
    // ステップ3: 各数字の判定結果を計算
    const results = guessArr.map((num, i) => {
        if (num === targetAnswer[i]) return "correct"; // 位置と数字が一致
        if (targetAnswer.includes(num)) return "present"; // 数字は含まれるが位置が違う
        return "absent"; // 数字が含まれない
    });
    
    // ステップ4: 現在の行番号を取得
    const rowIdx = currentAttempt;
    
    // ステップ5: ゲームを一時的に終了状態に設定（次の入力まで） ← この行を削除
    
    // ステップ6: 1文字ずつ色を変えるアニメーション演出
    for (let i = 0; i < GRID_SIZE; i++) {
        // ステップ6-1: 対応するタイル要素を取得
        const tile = document.getElementById(`tile-${rowIdx}-${i}`);
        // ステップ6-2: 判定結果のクラスを追加して色を変える
        tile.classList.add(results[i]);
        // ステップ6-3: キーボードのボタンも更新
        updateKeyboard(guessArr[i], results[i]);
        // ステップ6-4: 200ミリ秒待機して次の文字へ
        await new Promise(r => setTimeout(r, 200));
    }
    
    // ステップ7: 現在の推測を履歴に保存
    saveMove(currentGuess);
    
    // ステップ8: 勝敗を判定
    if (currentGuess === targetAnswer.join("")) {
        // ステップ8-1: 正解の場合、勝利として終了
        endGame(true);
    } else if (currentAttempt >= MAX_ATTEMPTS - 1) {
        // ステップ8-2: 試行回数が上限に達した場合、敗北として終了
        endGame(false);
    } else {
        // ステップ8-3: まだ続けられる場合、次の試行へ
        currentAttempt++;
        currentGuess = "";
    }
}

function updateKeyboard(num, status) {
    // ステップ1: 対応するキーボードボタンを取得
    const keyBtn = document.querySelector(`.key[data-key="${num}"]`);
    
    // ステップ2: すでに正解状態の場合は更新しない
    if (keyBtn.classList.contains("correct")) return;
    
    // ステップ3: すでに存在状態で、新たに不正解の場合は更新しない
    if (keyBtn.classList.contains("present") && status === "absent") return;
    
    // ステップ4: 既存の状態クラスを削除
    keyBtn.classList.remove("present", "absent");
    
    // ステップ5: 新しい状態クラスを追加
    keyBtn.classList.add(status);
}

function endGame(win) {
    // ステップ1: ゲームを完全に終了状態に設定
    isGameOver = true;
    
    // ステップ2: 統計情報を更新
    updateStats(win);
    
    // ステップ3: 800ミリ秒後に結果モーダルを表示
    setTimeout(() => showModal(), 800);
}

// 統計処理
function updateStats(win) {
    // ステップ1: localStorageから既存の統計データを取得（なければデフォルト値）
    let stats = JSON.parse(localStorage.getItem("num_stats")) || {played:0, wins:0, maxStreak:0, curStreak:0};
    
    // ステップ2: プレイ回数を1増やす
    stats.played++;
    
    // ステップ3: 勝敗に応じて統計を更新
    if (win) {
        // ステップ3-1: 勝利数のカウントアップ
        stats.wins++;
        // ステップ3-2: 現在の連勝数を増やす
        stats.curStreak++;
        // ステップ3-3: 最大連勝数を更新（必要なら）
        if (stats.curStreak > stats.maxStreak) stats.maxStreak = stats.curStreak;
    } else {
        // ステップ3-4: 敗北の場合は連勝数をリセット
        stats.curStreak = 0;
    }
    
    // ステップ4: 更新した統計をlocalStorageに保存
    localStorage.setItem("num_stats", JSON.stringify(stats));
}

function showModal() {
    // ステップ1: localStorageから統計データを取得
    const stats = JSON.parse(localStorage.getItem("num_stats"));
    
    // ステップ2: 統計データがない場合は何もしない
    if(!stats) return;
    
    // ステップ3: 各統計値をHTML要素に設定
    document.getElementById("stat-played").textContent = stats.played; // プレイ回数
    document.getElementById("stat-wins").textContent = stats.wins; // 勝利数
    document.getElementById("stat-winrate").textContent = Math.round((stats.wins / stats.played) * 100) || 0; // 勝率（パーセント）
    document.getElementById("stat-streak").textContent = stats.maxStreak; // 最大連勝数
    
    // ステップ4: 今日の正解ナンバーを表示
    document.getElementById("today-answer").textContent = targetAnswer.join("");
    
    // ステップ5: モーダルを表示
    document.getElementById("modal").style.display = "flex";
}

function saveMove(guess) {
    // ステップ1: localStorageから既存の履歴を取得（なければ空配列）
    let history = JSON.parse(localStorage.getItem("num_history")) || [];
    
    // ステップ2: 現在の推測を履歴に追加
    history.push(guess);
    
    // ステップ3: 更新した履歴をlocalStorageに保存
    localStorage.setItem("num_history", JSON.stringify(history));
    
    // ステップ4: 最終プレイ日を保存
    localStorage.setItem("num_last_date", new Date().toDateString());
}

function loadProgress() {
    // ステップ1: localStorageから最終プレイ日を取得
    const lastDate = localStorage.getItem("num_last_date");
    
    // ステップ2: 最終プレイ日が今日と同じ場合のみ進行状況を復元
    if (lastDate === new Date().toDateString()) {
        // ステップ2-1: localStorageから履歴を取得
        const history = JSON.parse(localStorage.getItem("num_history"));
        
        // ステップ2-2: 履歴がない場合は何もしない
        if (!history) return;
        
        // ステップ2-3: 履歴の各推測を順番に処理
        history.forEach(guess => {
            // ステップ2-3-1: 推測を文字配列に変換
            const guessArr = guess.split("");
            
            // ステップ2-3-2: 各文字の判定結果を計算
            const results = guessArr.map((num, i) => {
                if (num === targetAnswer[i]) return "correct";
                if (targetAnswer.includes(num)) return "present";
                return "absent";
            });
            
            // ステップ2-3-3: 現在の試行回数の行に結果を表示
            for (let i = 0; i < GRID_SIZE; i++) {
                const tile = document.getElementById(`tile-${currentAttempt}-${i}`);
                tile.textContent = guess[i];
                tile.classList.add(results[i]);
                updateKeyboard(guess[i], results[i]);
            }
            
            // ステップ2-3-4: 正解していた場合はゲーム終了状態に設定
            if (guess === targetAnswer.join("")) {
                isGameOver = true;
                showModal();
            }
            
            // ステップ2-3-5: 試行回数を進める
            currentAttempt++;
        });
        
        // ステップ2-4: 現在の推測をリセット
        currentGuess = "";
        
        // ステップ2-5: 6回全て試行して負けた場合もゲーム終了状態にする
        if (history.length === MAX_ATTEMPTS && history[history.length - 1] !== targetAnswer.join("")) {
            isGameOver = true;
            showModal();
        }
    }
}

// シェア機能
document.getElementById("share-btn").onclick = () => {
    // ステップ1: localStorageから履歴を取得
    const history = JSON.parse(localStorage.getItem("num_history"));
    
    // ステップ2: 現在の日付を取得
    const dateStr = new Date().toLocaleDateString();
    
    // ステップ3: シェアテキストの初期部分を作成
    let shareText = `ふんふんなんばー ${dateStr}\n${history.length}/${MAX_ATTEMPTS}\n\n`;
    
    // ステップ4: 履歴の各推測を絵文字で表現
    history.forEach(guess => {
        // ステップ4-1: 推測を1文字ずつ処理
        guess.split("").forEach((num, i) => {
            if (num === targetAnswer[i]) shareText += "🟩"; // 正解位置
            else if (targetAnswer.includes(num)) shareText += "🟨"; // 数字あり位置違い
            else shareText += "⬛"; // 不正解
        });
        // ステップ4-2: 各推測の後に改行
        shareText += "\n";
    });
    
    // ステップ5: ページURLを追加
    shareText += "\n" + window.location.href;
    
    // ステップ6: クリップボードにコピー
    navigator.clipboard.writeText(shareText).then(() => {
        // ステップ6-1: コピー成功時にメッセージを表示
        document.getElementById("message").textContent = "コピーしました！";
    });
};

// リスナー登録
// ステップ1: キーボードイベントのリスナー設定
window.addEventListener("keydown", (e) => handleInput(e.key));
// ステップ2: 仮想キーボードボタンのクリックイベント設定
document.querySelectorAll(".key").forEach(btn => {
    btn.onclick = () => handleInput(btn.getAttribute("data-key"));
});

// script.js の最後の方（リスナー登録付近）に追加
// ステップ3: モーダルを閉じるボタンのイベント設定
document.getElementById("modal-close").onclick = () => {
    document.getElementById("modal").style.display = "none";
};

// オプション：背景（黒い部分）をクリックしても閉じられるようにする場合
// ステップ4: モーダル背景クリックで閉じるイベント設定
window.onclick = (event) => {
    const modal = document.getElementById("modal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

// ステップ5: ゲーム初期化
initGame();