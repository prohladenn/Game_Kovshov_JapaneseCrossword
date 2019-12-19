const app = document.getElementById("app");
const check = document.getElementById("check");
const timer = document.getElementById("timer");
const complexity = document.getElementById('complexity');
const level = document.getElementById('level');
const scoreboard = document.getElementById('scoreboard');
const name = document.getElementById('name');
const theme = document.getElementById('theme');
const userData = [];
const score = getScoreTable();
let currentLevel;
let currentComplexity;
let currentName;


complexity.addEventListener('change', (e) => {
    fill(e.target.value)
});
theme.addEventListener('change', (e) => {
    setTheme(e.target.value)
})
document.getElementById('start').addEventListener('click', () => {
    if (!name.value)
        return alert('Введите имя');
    init(complexity.value, level.value)
});
check.addEventListener("click", () => {
    if (checkResult()) {
        pushScore();
        clearTimeout(timer._timer);
    }
});

function createMatrix(h, w, cell) {
    const block = document.createElement("div");
    block.classList.add("block");
    const matrix = [];
    for (let i = 0; i < h; i++) {
        matrix[i] = [];
        const flex = document.createElement("div");
        flex.classList.add("row");
        for (let j = 0; j < w; j++) {
            const htmlElement = document.createElement("div");
            htmlElement.classList.add(cell);
            flex.appendChild(htmlElement);
            matrix[i][j] = htmlElement;
            if (cell === "game_cell") {
                htmlElement.addEventListener("click", () => {
                    if (htmlElement.classList.contains("active")) {
                        htmlElement.classList.remove("active")
                        userData[i][j] = 0;
                    } else {
                        htmlElement.classList.add("active");
                        userData[i][j] = 1;
                    }
                });
            } else {
                htmlElement.classList.add('mute')
            }
        }
        block.appendChild(flex);
    }
    return {
        div: block,
        matrix: matrix
    };
}

function init(complexityLevel, level) {
    app.innerHTML = '';
    if (timer._timer) clearTimeout(timer._timer);
    currentComplexity = complexityLevel;
    currentLevel = data[complexityLevel][level];
    currentName = name.value;
    const h = currentLevel.row.length;
    const w = currentLevel.column.length;

    for (let i = 0; i < h; i++) {
        userData[i] = [];
        for (let j = 0; j < w; j++) {
            userData[i][j] = 0;
        }
    }

    const maxCol = Math.max(...currentLevel.column.map(c => c.length));
    const maxRow = Math.max(...currentLevel.row.map(r => r.length));

    const a1 = createMatrix(maxCol, maxRow, "empty_cell");
    const a2 = createMatrix(maxCol, currentLevel.column.length, "cell");
    for (let j = 0; j < currentLevel.column.length; j++) {
        for (let i = maxCol - currentLevel.column[j].length, k = 0; i < maxCol; i++, k++) {
            a2.matrix[i][j].innerText = currentLevel.column[j][k];
        }
    }
    const b1 = createMatrix(h, maxRow, "cell");
    for (let i = 0; i < h; i++) {
        for (let j = maxRow - currentLevel.row[i].length, k = 0; j < maxRow; j++, k++) {
            b1.matrix[i][j].innerText = currentLevel.row[i][k];
        }
    }
    const b2 = createMatrix(h, currentLevel.column.length, "game_cell");
    app.append(...[a1, a2, b1, b2].map(e => e.div));
    app.style.width = `${(currentLevel.column.length + maxRow) * 22 + 4}px`;
    app.style.display = 'flex';
    check.style.display = 'block';
    buildScoreTable();
    startTimer();
}

function startTimer() {
    timer.innerText = '00:00';
    const start = Date.now();
    const int = 1000;
    let exp = start + int;
    timer._timer = setTimeout(step, int);
    timer._time = 0;

    function step() {
        const now = Date.now();
        const diff = now - exp;
        exp += int;
        timer.innerText = timestampToString(now - start);
        timer._time = now - start;
        timer._timer = setTimeout(step, int - diff);
    }
}

function timestampToString(value) {
    const time = Math.floor(value / 1000);
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`
}

function fill(complexity) {
    level.innerHTML = '';
    level.append(...data[complexity].map((e, i) => {
        const option = document.createElement('option');
        option.setAttribute('value', i);
        option.innerText = e.name;
        return option;
    }));
}

function getScoreTable() {
    const json = localStorage.getItem('score');
    if (json) {
        try {
            return JSON.parse(json);
        } catch (e) {
            return {};
        }
    }
    return {};
}

function pushScore() {
    const result = {name: currentName, time: timer._time};
    if (!score[currentComplexity])
        score[currentComplexity] = {};
    const arr = score[currentComplexity][currentLevel.name];
    if (arr)
        arr.push(result);
    else
        score[currentComplexity][currentLevel.name] = [result];
    localStorage.setItem('score', JSON.stringify(score))
    buildScoreTable();
}

function buildScoreTable() {
    const arr = (score[currentComplexity]) ?
        (score[currentComplexity][currentLevel.name]) ? score[currentComplexity][currentLevel.name] : [] : [];
    arr.sort((a, b) => a.time - b.time);
    scoreboard.innerHTML = '';
    arr.forEach(result => {
        const record = document.createElement('div');
        const time = document.createElement('div');
        time.classList.add('time');
        time.innerText = `${timestampToString(result.time)}`;
        record.innerText = `${result.name}:`;
        record.appendChild(time);
        scoreboard.append(record);
    })
}

function setTheme(name) {
    if (name === 'dark') {
        if (theme.value !== 'dark') theme.value = 'dark';
        document.body.classList.add('dark');
    } else
        document.body.classList.remove('dark');
    localStorage.setItem('theme', name);
}

function checkResult() {
    for (let i = 0; i < currentLevel.answer.length; i++) {
        for (let j = 0; j < currentLevel.answer[i].length; j++) {
            if (userData[i][j] !== currentLevel.answer[i][j]) {
                return false;
            }
        }
    }
    return true;
}

app.style.display = 'none';
check.style.display = 'none';
fill('easy');
setTheme(localStorage.getItem('theme'));
//init('easy', 0);

