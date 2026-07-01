const FALLBACK_DATA = `id,word,answer,hint,category
1,犬も歩けば棒に当たる,いぬもあるけばぼうにあたる,何か行動を起こせば幸運に出会ったり災難に遭ったりすること,ことわざ
2,猫に小判,ねこにこばん,価値のわからない者に高価なものを与えても無駄になること,ことわざ
3,猿も木から落ちる,さるもきからおちる,どんな名人でも時には失敗することがあること,ことわざ`;

const STORAGE_KEYS = {
    stats: 'kotowaza_stats',
    daily: 'kotowaza_daily',
};

let entries = [];
let currentEntry = null;
let currentMode = 'tap';
let currentDateKey = '';
let selectedDate = '';
let archiveMode = false;
let handLetters = [];
let answerLetters = [];
let lockedSlots = [];
let hintUsed = false;
let guessHistory = [];
let gameCompleted = false;
let currentStats = null;
let lastFocusedElement = null;

function createTile(char, id = null) {
    // 1文字を表すオブジェクトを作成します。重複文字でも ID が違うので区別できます。
    // 既存の ID が渡された場合は、必ずそれを優先して使います。
    return {
        id: id ?? `tile-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        char,
    };
}

function createTileList(text) {
    // 文字列を 1文字ずつのタイル配列へ変換します。
    return text.split('').map((char, index) => createTile(char, `tile-${index}-${char}`));
}

function normalizeTile(value, index = 0) {
    // 保存データや旧データからもタイルオブジェクトへ安全に戻せるようにします。
    if (value && typeof value === 'object' && typeof value.char === 'string') {
        return createTile(value.char, value.id || `tile-${index}-${value.char}`);
    }
    if (typeof value === 'string' && value) {
        return createTile(value, `tile-${index}-${value}`);
    }
    return null;
}

function normalizeTileList(items) {
    // タイル配列を統一した形式へ整えます。
    if (!Array.isArray(items)) return [];
    return items.map((item, index) => normalizeTile(item, index)).filter(Boolean);
}

function getTileText(tile) {
    return tile?.char || '';
}

function getTileTextList(tiles) {
    return (tiles || []).map((tile) => getTileText(tile)).join('');
}

async function initGame() {
    // ゲームを始める前に、まずボタンやモーダルの動きを準備します。
    bindEvents();
    closeModal();
    // CSVから問題データを読み込み、今日の問題を決めます。
    await loadEntries();
    resolveGameDate();
    startNewGame();
}

function bindEvents() {
    document.getElementById('submit-btn').addEventListener('click', submitGuess);
    document.getElementById('backspace-btn').addEventListener('click', removeLastLetter);
    document.getElementById('shuffle-btn').addEventListener('click', shuffleHand);
    document.getElementById('hint-btn').addEventListener('click', showHint);
    document.getElementById('giveup-btn').addEventListener('click', giveUp);
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('share-btn').addEventListener('click', shareResult);
    document.getElementById('result-modal').addEventListener('click', (event) => {
        if (event.target.id === 'result-modal') closeModal();
    });
}

async function loadEntries() {
    // 問題データをCSVから読み込みます。読み込めなかった場合は、すぐ使える仮データへ切り替えます。
    try {
        const response = await fetch('dataset.csv');
        if (!response.ok) throw new Error('CSV load failed');
        const text = await response.text();
        entries = parseCsv(text);
    } catch (error) {
        console.warn('dataset.csvの読み込みに失敗したため、フォールバックを使用します。', error);
        entries = parseCsv(FALLBACK_DATA);
    }
}

function parseCsv(text) {
    // CSVの1行を1つの問題として分解し、扱いやすいオブジェクトにします。
    // カンマが解説文に含まれていても壊れないよう、簡易的な CSV パーサを使います。
    const rows = text.trim().split(/\r?\n/).filter(Boolean);
    if (!rows.length) return [];
    rows.shift();

    return rows.map((row) => {
        const matches = row.match(/("[^"]*(?:""[^"]*)*"|[^,]+)/g) || [];
        const values = matches.map((value) => value.replace(/^"|"$/g, '').replace(/""/g, '"'));
        const [id, word, answer, hint, category] = values;
        return { id, word, answer, hint, category };
    }).filter((entry) => entry.answer);
}

function resolveGameDate() {
    // URLのdateパラメータがあれば、その日付の問題を表示し、なければ今日の問題を表示します。
    // 端末のローカルタイムとして明示的に扱うため、年・月・日を分解して Date を作ります。
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('date');
    const today = toDateKey(new Date());

    if (!requested) {
        selectedDate = today;
        archiveMode = false;
        return;
    }

    const [y, m, d] = requested.split('-').map(Number);
    const parsed = new Date(y, m - 1, d, 0, 0, 0);
    if (Number.isNaN(parsed.getTime())) {
        selectedDate = today;
        archiveMode = false;
        return;
    }

    const [todayY, todayM, todayD] = today.split('-').map(Number);
    const todayValue = new Date(todayY, todayM - 1, todayD, 0, 0, 0).getTime();
    const requestedValue = parsed.getTime();
    if (requestedValue > todayValue) {
        selectedDate = today;
        archiveMode = false;
        return;
    }

    selectedDate = requested;
    archiveMode = true;
}

function startNewGame() {
    // 今日の問題を決めたら、前回の続きがあれば復元し、なければ新しく始めます。
    currentDateKey = selectedDate;
    const index = getIndexForDate(selectedDate);
    currentEntry = entries[index] || entries[0];

    if (!currentEntry) {
        document.getElementById('topic-display').textContent = '問題データが読み込めませんでした';
        return;
    }

    if (!archiveMode) {
        const savedState = loadDailyState();
        if (savedState) {
            restoreDailyState(savedState);
            renderGame();
            if (savedState.isCleared) {
                gameCompleted = true;
                document.getElementById('status-text').textContent = '今日の問題はすでにクリア済みです';
                showResultModal(savedState.resultType || 'clear', savedState);
            }
            return;
        }
    }

    initializeFreshState();
    renderGame();
}

function initializeFreshState() {
    // 新しく始めるときは、手札・解答欄・ヒント使用状態を初期化します。
    const initialTiles = createTileList(currentEntry.answer);
    handLetters = shuffleArray(initialTiles);
    answerLetters = Array.from({ length: currentEntry.answer.length }, () => null);
    lockedSlots = Array.from({ length: currentEntry.answer.length }, () => false);
    hintUsed = false;
    guessHistory = [];
    gameCompleted = false;
    currentStats = loadStats();
}

function restoreDailyState(savedState) {
    // 保存されていた盤面や履歴を読み戻して、途中から続けられるようにします。
    currentMode = savedState.mode || currentMode;
    handLetters = normalizeTileList(savedState.handLetters || []);
    answerLetters = Array.from({ length: currentEntry.answer.length }, (_, index) => {
        const value = Array.isArray(savedState.answerLetters) ? savedState.answerLetters[index] : null;
        return value == null ? null : normalizeTile(value, index);
    });
    lockedSlots = Array.isArray(savedState.lockedSlots)
        ? savedState.lockedSlots.map((value) => !!value)
        : Array.from({ length: currentEntry.answer.length }, () => false);
    hintUsed = !!savedState.isHintUsed;
    guessHistory = Array.isArray(savedState.history) ? [...savedState.history] : [];
    gameCompleted = !!savedState.isCleared;
    currentStats = loadStats();
}

function getIndexForDate(dateKey) {
    const [year, month, day] = dateKey.split('-').map(Number);
    const start = Date.UTC(1970, 0, 1);
    const target = Date.UTC(year, month - 1, day);
    const diffDays = Math.floor((target - start) / 86400000);
    return Math.abs(diffDays) % entries.length;
}

function toDateKey(date) {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function getRemainingCandidateLetters() {
    // まだ確定していないマスに入っている文字と、手札に残っている文字をまとめて取得します。
    const unresolvedFromBoard = answerLetters
        .filter((tile, index) => tile && !lockedSlots[index])
        .map((tile) => getTileText(tile));
    const unresolvedFromHand = handLetters.map((tile) => getTileText(tile));
    return unresolvedFromBoard.concat(unresolvedFromHand);
}

function countDistinctPermutations(chars) {
    // 重複文字を含む場合でも、同じ並びが二重に数えられないように factorial を使って数えます。
    if (!Array.isArray(chars) || !chars.length) return 1;

    const counts = {};
    chars.forEach((char) => {
        counts[char] = (counts[char] || 0) + 1;
    });

    let numerator = 1;
    for (let index = 2; index <= chars.length; index += 1) {
        numerator *= index;
    }

    let denominator = 1;
    Object.values(counts).forEach((count) => {
        for (let index = 2; index <= count; index += 1) {
            denominator *= index;
        }
    });

    return numerator / denominator;
}

function getCandidateCount(pattern) {
    // 表示用の候補数は、辞書検索ではなく現在の未確定文字から作れる純粋なアナグラム数を返します。
    if (!currentEntry?.answer) return 0;

    const remainingLetters = getRemainingCandidateLetters();
    return countDistinctPermutations(remainingLetters);
}

function getCandidateLabel(pattern) {
    // 現在の未確定文字から作れる並び替えパターン数を、見やすい文字列へ整えます。
    const count = getCandidateCount(pattern);
    return count.toLocaleString();
}

function formatHistoryItem(item) {
    // 履歴用の表示は、毎回現在の盤面で再計算せず、保存済みの label をそのまま使います。
    if (typeof item === 'string') {
        return `${item} ${getCandidateLabel(item)}`;
    }
    const pattern = item.pattern || '';
    const label = typeof item.label === 'string' ? item.label : getCandidateLabel(pattern);
    return `${pattern} ${label}`;
}

function formatInGameHistoryItem(item) {
    if (typeof item === 'string') {
        return `${item}`;
    }
    const letters = Array.isArray(item.letters) ? item.letters : [];
    const lettersMarkup = letters.length
        ? `<span class="history-letters">${letters.map((letter, index) => {
            const isCorrect = Array.isArray(item.correctIndexes) && item.correctIndexes.includes(index);
            return `<span class="history-letter${isCorrect ? ' correct' : ''}">${letter}</span>`;
        }).join('')}</span>`
        : '';
    return lettersMarkup;
}

function renderGame() {
    // 画面の見た目を、今の状態に合わせて毎回描き直します。
    const categoryLabel = (currentEntry.category || 'ことわざ').replace(/\s+/g, '');
    document.getElementById('topic-display').innerHTML = `
        <div class="topic-title">${currentEntry.answer.length}文字</div>
        <div class="topic-subtitle">ひらがなで${categoryLabel}を組み立てよう</div>
    `;
    document.getElementById('status-text').textContent = `文字をタップして${categoryLabel}を解答欄へ入れよう`;

    const latestGuess = guessHistory[guessHistory.length - 1];
    const latestPattern = latestGuess && typeof latestGuess === 'object' ? latestGuess.pattern : latestGuess;
    const candidateLabel = getCandidateLabel(latestPattern || '');
    const candidateCountLabel = document.getElementById('candidate-count');
    candidateCountLabel.textContent = `残り候補数: ${candidateLabel}`;

    const hintArea = document.getElementById('hint-area');
    if (hintUsed) {
        hintArea.innerHTML = `<strong>ヒント:</strong> ${currentEntry.hint}`;
        hintArea.classList.remove('hidden');
    } else {
        hintArea.classList.add('hidden');
        hintArea.innerHTML = '';
    }

    renderAnswerBoard();
    renderHandBoard();
    renderHistory();
}

function renderAnswerBoard() {
    // 解答欄の各マスを、今入っている文字に応じて表示します。
    const board = document.getElementById('answer-board');
    board.innerHTML = '';

    for (let index = 0; index < currentEntry.answer.length; index += 1) {
        const slot = document.createElement('button');
        slot.className = 'answer-slot';
        slot.dataset.index = index;
        const currentTile = answerLetters[index];
        slot.textContent = getTileText(currentTile);

        if (currentTile) {
            slot.classList.add('filled');
        } else {
            slot.classList.add('empty');
        }

        if (lockedSlots[index]) {
            slot.classList.add('locked');
            slot.disabled = true;
        } else {
            slot.addEventListener('click', () => removeLetterFromAnswer(index));
        }

        board.appendChild(slot);
    }
}

function renderHandBoard() {
    // 手札の文字を画面に並べて、置ける状態にします。
    const board = document.getElementById('hand-board');
    board.innerHTML = '';

    board.classList.remove('hidden');
    handLetters.forEach((tile, index) => {
        const tileButton = document.createElement('button');
        tileButton.className = 'hand-letter';
        tileButton.textContent = getTileText(tile);
        tileButton.addEventListener('click', () => placeLetter(index));
        board.appendChild(tileButton);
    });
}

function placeLetter(index) {
    // 手札のタイルを、空いている解答欄へ置きます。ID を保ったまま移動させます。
    if (gameCompleted) return;
    const tile = handLetters[index];
    const emptyIndex = answerLetters.findIndex((value) => value === null);
    if (emptyIndex === -1 || !tile) return;

    answerLetters[emptyIndex] = tile;
    handLetters.splice(index, 1);
    renderGame();
    if (!archiveMode) saveDailyState();
}

function removeLetterFromAnswer(index) {
    // 解答欄のタイルを取り外して、手札へ戻します。ID で正確に対応づけます。
    if (gameCompleted || lockedSlots[index]) return;
    const tile = answerLetters[index];
    if (!tile) return;
    answerLetters[index] = null;
    handLetters.push(tile);
    renderGame();
    if (!archiveMode) saveDailyState();
}

function removeLastLetter() {
    // 1つ前に置いた文字を取り消すために、最後の文字を消します。
    if (gameCompleted) return;
    for (let index = currentEntry.answer.length - 1; index >= 0; index -= 1) {
        if (answerLetters[index]) {
            removeLetterFromAnswer(index);
            break;
        }
    }
}

function shuffleHand() {
    // 手札の並び順をランダムに入れ替えます。
    if (gameCompleted) return;
    handLetters = shuffleArray(handLetters);
    renderHandBoard();
    if (!archiveMode) saveDailyState();
}

function showHint() {
    // ヒントを表示して、以後のプレイに反映します。
    if (gameCompleted) return;
    hintUsed = true;
    const hintArea = document.getElementById('hint-area');
    hintArea.innerHTML = `<strong>ヒント:</strong> ${currentEntry.hint}`;
    hintArea.classList.remove('hidden');
    renderHistory();
    if (!archiveMode) saveDailyState();
}

function submitGuess() {
    // 解答欄が埋まっていれば、結合文字列で正解かを判定して結果を記録します。
    if (gameCompleted) return;
    if (answerLetters.some((value) => value === null)) {
        document.getElementById('status-text').textContent = 'まだすべてのマスを埋めていません';
        return;
    }

    const expected = currentEntry.answer;
    const submittedValue = getTileTextList(answerLetters);
    const resultTiles = [];
    const nextAnswer = Array.from({ length: currentEntry.answer.length }, () => null);
    const nextHand = [];

    answerLetters.forEach((tile, index) => {
        const letter = getTileText(tile);
        if (letter === expected[index]) {
            lockedSlots[index] = true;
            nextAnswer[index] = tile;
            resultTiles.push('🟩');
        } else {
            resultTiles.push('⬛');
            nextHand.push(tile);
        }
    });

    handLetters = shuffleArray(nextHand.concat(handLetters));
    answerLetters = nextAnswer;
    const pattern = resultTiles.join('');
    // この手番での残り候補数を、履歴に保存する時点で固定しておきます。
    const remainingCandidates = getCandidateLabel(pattern);
    const correctIndexes = answerLetters.reduce((indexes, tile, index) => {
        if (getTileText(tile) === expected[index]) {
            indexes.push(index);
        }
        return indexes;
    }, []);
    guessHistory.push({
        pattern,
        label: remainingCandidates,
        letters: submittedValue.split(''),
        correctIndexes,
    });
    renderGame();

    if (!archiveMode) {
        updateGuessStats();
        saveDailyState();
    }

    // クリアは「今回の入力が完全一致」または「今回の判定で全マスが🟩」の場合だけに限定します。
    const isPerfectMatch = submittedValue === currentEntry.answer;
    const isAllGreen = pattern === '🟩'.repeat(currentEntry.answer.length);
    if (isPerfectMatch || isAllGreen) {
        finishGame('clear');
    }
}

function finishGame(type) {
    // クリアまたはギブアップになったら、結果画面を表示します。
    gameCompleted = true;
    if (!archiveMode) {
        const stats = loadStats();
        stats.totalPlayed += 1;
        if (type === 'clear') {
            stats.currentStreak += 1;
            stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
        } else {
            stats.currentStreak = 0;
        }
        saveStats(stats);
        saveDailyState({ isCleared: true, resultType: type });
    }
    showResultModal(type);
}

function giveUp() {
    // やむを得ないときは、答えを見せてゲームを終了します。
    if (gameCompleted) return;
    const confirmed = window.confirm('ギブアップして答えを表示しますか？');
    if (!confirmed) return;
    answerLetters = createTileList(currentEntry.answer);
    lockedSlots = Array.from({ length: currentEntry.answer.length }, () => true);
    handLetters = [];
    finishGame('giveup');
}

function renderHistory() {
    // これまでの入力結果を、画面上に履歴として表示します。
    const history = document.getElementById('history-list');
    if (!guessHistory.length) {
        history.innerHTML = '';
        return;
    }
    history.innerHTML = guessHistory.map((item) => `<span class="history-chip">${formatInGameHistoryItem(item)}</span>`).join('');
}

function loadStats() {
    // 連勝やプレイ回数などの統計情報を保存しておきます。
    const saved = localStorage.getItem(STORAGE_KEYS.stats);
    if (!saved) {
        return { currentStreak: 0, maxStreak: 0, totalPlayed: 0, totalGuesses: 0 };
    }
    return JSON.parse(saved);
}

function saveStats(stats) {
    // 統計情報をブラウザに保存します。
    localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
}

function loadDailyState() {
    // 今日の盤面をリロード前の状態から復元できるように保存しておきます。
    if (archiveMode) return null;
    const saved = localStorage.getItem(STORAGE_KEYS.daily);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return parsed.date === currentDateKey ? parsed : null;
}

function saveDailyState(overrides = {}) {
    // 盤面の状態を毎回保存して、途中離脱後も続けられるようにします。
    if (archiveMode) return;
    const state = {
        date: currentDateKey,
        isCleared: !!overrides.isCleared || false,
        isHintUsed: hintUsed,
        history: guessHistory,
        resultType: overrides.resultType || null,
        handLetters: handLetters,
        answerLetters: answerLetters,
        lockedSlots: lockedSlots,
    };
    localStorage.setItem(STORAGE_KEYS.daily, JSON.stringify(state));
}

function updateGuessStats() {
    // 1回の判定ごとに、試行回数を統計に反映します。
    currentStats = loadStats();
    currentStats.totalGuesses += 1;
    saveStats(currentStats);
}

function showResultModal(type, state = null) {
    // クリアやギブアップの結果をモーダルで表示します。
    if (!gameCompleted && !state?.isCleared) return;
    if (!currentEntry) return;
    lastFocusedElement = document.activeElement;

    const modal = document.getElementById('result-modal');
    const title = document.getElementById('result-title');
    const summary = document.getElementById('result-summary');
    const details = document.getElementById('result-details');
    const stats = document.getElementById('stats-summary');
    const closeButton = document.getElementById('modal-close');

    const statsData = loadStats();
    if (type === 'clear') {
        title.textContent = '正解！🎉';
        summary.innerHTML = `<div><strong>${currentEntry.category || 'ことわざ'}:</strong> ${currentEntry.word}</div><div><strong>読み:</strong> ${currentEntry.answer}</div>`;
        details.innerHTML = `
            <div><strong>解説:</strong> ${currentEntry.hint}</div>
            <div><strong>今回の手数:</strong> ${guessHistory.length || 1}手</div>
            <div><strong>ヒント:</strong> ${hintUsed ? '使用済み 💡' : '未使用 🧠'}</div>
        `;
    } else {
        title.textContent = 'ギブアップ 👁️';
        summary.innerHTML = `<div><strong>${currentEntry.category || 'ことわざ'}:</strong> ${currentEntry.word}</div><div><strong>読み:</strong> ${currentEntry.answer}</div>`;
        details.innerHTML = `
            <div><strong>解説:</strong> ${currentEntry.hint}</div>
            <div><strong>今回の手数:</strong> ${guessHistory.length || 0}手</div>
            <div><strong>ヒント:</strong> ${hintUsed ? '使用済み 💡' : '未使用 🧠'}</div>
        `;
    }

    stats.innerHTML = `
        <div><strong>プレイ回数:</strong> ${statsData.totalPlayed}</div>
        <div><strong>現在の連勝:</strong> ${statsData.currentStreak}</div>
        <div><strong>最高連勝:</strong> ${statsData.maxStreak}</div>
        <div><strong>平均解答回数:</strong> ${(statsData.totalGuesses / Math.max(statsData.totalPlayed, 1)).toFixed(1)}回</div>
    `;

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(() => {
        if (closeButton) closeButton.focus();
    }, 10);
}

function closeModal() {
    // 結果モーダルを閉じて、元の画面に戻します。
    const modal = document.getElementById('result-modal');
    const closeButton = document.getElementById('modal-close');
    if (closeButton) closeButton.blur();
    if (modal) {
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }

        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('modal-open');
}

function shareResult() {
    // リザルト内容をクリップボードにコピーします。
    const shareText = buildShareText();

    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(shareText).then(() => {
            document.getElementById('share-message').textContent = 'コピーしました！';
        }).catch(() => {
            document.getElementById('share-message').textContent = 'コピーに失敗しました';
        });
        return;
    }

    document.getElementById('share-message').textContent = '共有機能に対応していません';
}

function buildShareText() {
    // シェア文面は、クリアかギブアップかで文章を分けて出力します。
    const dateLabel = currentDateKey;
    const guessCount = Math.max(guessHistory.length, 1);
    const historyItems = guessHistory.map((item) => formatHistoryItem(item));
    const historyText = historyItems.length > 5
        ? [historyItems[0], historyItems[1], '(中略)', historyItems[historyItems.length - 1]].join('\n')
        : historyItems.join('\n');
    const status = hintUsed ? '【ヒント使用 💡】' : '【ノーヒント 🧠】';

    const isCleared = guessHistory.length > 0 && (
        guessHistory[guessHistory.length - 1].pattern === '🟩'.repeat(currentEntry.answer.length)
        || getTileTextList(answerLetters) === currentEntry.answer
    );

    if (isCleared) {
        return `ふんふんあなぐらむ ${dateLabel}\n${historyText}\n\n${guessCount}手でクリア！${status}\n${window.location.href}`;
    }

    return `ふんふんあなぐらむ ${dateLabel}\n${historyText}\n\nギブアップしました\n${window.location.href}`;
}

function shuffleArray(items) {
    // 配列の順番をランダムに並び替えるための補助関数です。
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
}

initGame();