const complexity = document.getElementById('complexity');
const scoreboard = document.getElementById('scoreboard');
const awesome = document.getElementById("awesome");
const check = document.getElementById("check");
const timer = document.getElementById("timer");
const level = document.getElementById('level');
const theme = document.getElementById('theme');
const name = document.getElementById('name');
const app = document.getElementById("app");
const score = getScoreTable();
const userData = [];
let userMatrix = [];
let currentComplexity;
let currentLevel;
let currentName;
let active = false;
let constructor = false;
let customLevelCount = 0;

complexity.addEventListener('change', (e) => {
    fill(e.target.value)
});

theme.addEventListener('change', (e) => {
    setTheme(e.target.value)
});

document.getElementById('start').addEventListener('click', () => {
    if (!name.value)
        return alert('Введите имя');
    check.innerText = 'Проверить';
    constructor = false;
    init(complexity.value, level.value);
    check.setAttribute('value', 'Сохранить')
});

document.getElementById('create').addEventListener('click', () => {
    constructor = true;
    init('tmp', 0, true);
    timer.style.display = 'none';
    check.innerText = 'Сохранить';
});

check.addEventListener("click", () => {
    if (constructor) {
        if (matrixContainsOnlyZeros(userData)) {
            return alert("Нельзя сохранить пустое поле!")
        }
        awesome.innerText = 'Ваш уровень сохранён!';
        awesome.style.display = 'block';
        app.style.display = 'none';
        check.style.display = 'none';
        check.innerText = 'Проверить';
        constructor = false;
        saveLevel();
    } else {
        if (checkResult() && active) {
            pushScore();
            active = false;
            awesome.style.display = 'block';
            clearTimeout(timer._timer);
        } else {

        }
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
                        if (htmlElement.classList.contains("broken")) {
                            htmlElement.classList.remove("broken");
                        }
                        htmlElement.classList.remove("active");
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

function init(complexityLevel, level, isConstructor) {
    app.innerHTML = '';
    if (timer._timer) clearTimeout(timer._timer);
    currentComplexity = complexityLevel;
    currentLevel = data[complexityLevel][level];
    currentName = name.value;
    let levelRow, levelColumn;
    if (isConstructor) {
        levelRow = currentLevel.row;
        levelColumn = currentLevel.column;
    } else {
        levelRow = getRow(currentLevel.answer);
        levelColumn = getColumn(currentLevel.answer);
    }
    const h = levelRow.length;
    const w = levelColumn.length;

    for (let i = 0; i < h; i++) {
        userData[i] = [];
        for (let j = 0; j < w; j++) {
            userData[i][j] = 0;
        }
    }

    const maxCol = Math.max(...levelColumn.map(c => c.length));
    const maxRow = Math.max(...levelRow.map(r => r.length));

    const a1 = createMatrix(maxCol, maxRow, "empty_cell");
    const a2 = createMatrix(maxCol, w, "cell");
    for (let j = 0; j < w; j++) {
        for (let i = maxCol - levelColumn[j].length, k = 0; i < maxCol; i++, k++) {
            a2.matrix[i][j].innerText = levelColumn[j][k];
        }
    }
    const b1 = createMatrix(h, maxRow, "cell");
    for (let i = 0; i < h; i++) {
        for (let j = maxRow - levelRow[i].length, k = 0; j < maxRow; j++, k++) {
            b1.matrix[i][j].innerText = levelRow[i][k];
        }
    }
    const b2 = createMatrix(h, w, "game_cell");
    userMatrix = b2.matrix;
    app.append(...[a1, a2, b1, b2].map(e => e.div));
    app.style.width = `${(w + maxRow) * 22 + 4}px`;
    app.style.display = 'flex';
    check.style.display = 'block';
    timer.style.display = 'block';
    awesome.style.display = 'none';
    awesome.innerText = 'Вы великолепны, ищите себя в таблице ->';
    buildScoreTable();
    active = true;
    if (!isConstructor)
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
    localStorage.setItem('score', JSON.stringify(score));
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
    let ans = true;
    for (let i = 0; i < currentLevel.answer.length; i++) {
        for (let j = 0; j < currentLevel.answer[i].length; j++) {
            if (userData[i][j] !== currentLevel.answer[i][j]) {
                ans = false;
                if (userData[i][j] === 1) {
                    userMatrix[i][j].classList.add("broken");
                }
            }
        }
    }
    return ans;
}

function saveLevel() {
    if (data.myLevels.length == 0) {
        const opt = document.createElement('option');
        opt.value = 'myLevels';
        opt.innerHTML = 'My levels';
        complexity.appendChild(opt);
    }
    const matrix = cutEmptyRowAndColumn(userData.slice());
    data.myLevels[customLevelCount] =
        {
            name: 'level ' + ++customLevelCount,
            row: getRow(matrix),
            column: getColumn(matrix),
            answer: matrix.slice()
        };
    fill(complexity.value);
}

function getRow(matrix) {
    let ans = [];
    for (let i = 0; i < matrix.length; i++) {
        ans.push([]);
        let tmp = 0;
        for (let j = 0; j < matrix[0].length; j++) {
            if (matrix[i][j] === 1) {
                tmp++;
            } else {
                if (tmp !== 0) {
                    ans[i].push(tmp);
                }
                tmp = 0;
            }
        }
        if (tmp !== 0) {
            ans[i].push(tmp);
        }
    }
    return ans;
}

function getColumn(matrix) {
    let ans = [];
    for (let i = 0; i < matrix[0].length; i++) {
        ans.push([]);
        let tmp = 0;
        for (let j = 0; j < matrix.length; j++) {
            if (matrix[j][i] === 1) {
                tmp++;
            } else {
                if (tmp !== 0) {
                    ans[i].push(tmp);
                }
                tmp = 0;
            }
        }
        if (tmp !== 0) {
            ans[i].push(tmp);
        }
    }
    return ans;
}

function cutEmptyRowAndColumn(matrix) {
    console.log(matrix);
    let startEmptyLineCount = 0, endEmptyLineCount = 0;
    for (let i = 0; i < matrix.length; i++) {
        if (arrayContainsOnlyZeros(matrix[i])) {
            startEmptyLineCount++;
        } else {
            break;
        }
    }
    for (let i = matrix.length - 1; i >= 0; i--) {
        if (arrayContainsOnlyZeros(matrix[i])) {
            endEmptyLineCount++;
        } else {
            break;
        }
    }
    console.log(startEmptyLineCount + " " + endEmptyLineCount);
    let startEmptyRowCount = 0, endEmptyRowCount = 0;
    for (let i = 0; i < matrix[0].length; i++) {
        let row = [];
        for (let j = 0; j < matrix.length; j++) {
            row.push(matrix[j][i]);
        }
        if (arrayContainsOnlyZeros(row)) {
            startEmptyRowCount++;
        } else {
            break;
        }
    }
    for (let i = matrix.length - 1; i >= 0; i--) {
        let row = [];
        for (let j = 0; j < matrix.length; j++) {
            row.push(matrix[j][i]);
        }
        if (arrayContainsOnlyZeros(row)) {
            endEmptyRowCount++;
        } else {
            break;
        }
    }
    console.log(startEmptyRowCount + " " + endEmptyRowCount);
    let newMatrix = [];
    for (let i = startEmptyLineCount; i < matrix.length - endEmptyLineCount; i++) {
        newMatrix.push([]);
        for (let j = startEmptyRowCount; j < matrix[0].length - endEmptyRowCount; j++) {
            newMatrix[i - startEmptyLineCount][j - startEmptyRowCount] = matrix[i][j];
        }
    }
    return newMatrix;
}

function matrixContainsOnlyZeros(matrix) {
    let ans = true;
    for (let i = 0; i < matrix.length; i++) {
        ans = ans && arrayContainsOnlyZeros(matrix[i]);
    }
    return ans;
}

function arrayContainsOnlyZeros(array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] !== 0)
            return false;
    }
    return true;
}

app.style.display = 'none';
check.style.display = 'none';
awesome.style.display = 'none';
fill('easy');
setTheme(localStorage.getItem('theme'));
