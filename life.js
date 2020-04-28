// life.js
"user strict";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const mouse = {x: 0, y: 0};
const highlight = {i: 0, j: 0};
let pause = true;

const pauseBtn = document.getElementById("userPause");
const mouseOut = document.getElementById("mousePosOut");

const grid = {
    gridWidth: 50,
    gridHeight: 50,
    g: [],
    next: [],
    setup: function () {
        this.g.length = 50 * 50;
        this.g.fill(false);
    },
    get: function (x, y) {
        return this.g[y * this.gridWidth + x];
    },
    set: function (x, y, val) {
        this.g[y * this.gridWidth + x] = val;
    },
    setNext: function (x, y, val) {
        this.next[y * this.gridWidth + x] = val;
    },
    applyNext: function () {
        this.g = this.next;
        this.next = [];
    },
    countAdj: function (x, y)
    {
        let count = 0;
        for (let i = 0; i < 3; i++)
        {
            if (this.get(x - 1, y + i - 1)) count++;
            if (this.get(x + 1, y + i - 1)) count++;
        }
        if (this.get(x, y - 1)) count++;
        if (this.get(x, y + 1)) count++;

        return count;
    }
}
const rules = (cell, adj) => {
    if ((adj === 3 || adj === 2) && cell) return true;
    else if (adj === 3 && !cell) return true;
    else return false;
}

const cellWidth = canvas.width / grid.gridWidth;
const cellHeight = canvas.height / grid.gridHeight;

let prvT = performance.now();
let delayT = 100;
const frame = () => {
    let curT = performance.now();
    let lapsed = curT - prvT;


    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw vertical grid lines.
    ctx.lineWidth = 0.1;
    ctx.strokeStyle = "grey"; 
    for (let i = 1; i < grid.gridWidth; i++) {
        ctx.beginPath();
        ctx.moveTo(cellWidth * i, 0);
        ctx.lineTo(cellWidth * i, canvas.height);
        ctx.closePath();
        ctx.stroke();
    }
    // Draw horizontal grid lines.
    for (let i = 1; i < grid.gridHeight; i++) {
        ctx.beginPath();
        ctx.moveTo(0, cellHeight * i);
        ctx.lineTo(canvas.width, cellHeight * i);
        ctx.closePath();
        ctx.stroke();
    }
    // Draw cells.
    for (let j = 0; j < grid.gridHeight; j++)
    {
        for (let i = 0; i < grid.gridWidth; i++)
        {
            if (grid.get(i, j)) {
                ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
            }
            if (mouse.x > i * cellWidth && mouse.x < (i * cellWidth + cellWidth) &&
                mouse.y > j * cellHeight && mouse.y < j * cellHeight + cellHeight) {
                highlight.i = i;
                highlight.j = j;
                ctx.lineWidth = 1;
                ctx.strokeStyle = "black"; 
                ctx.beginPath();
                ctx.rect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
                ctx.stroke();
                ctx.closePath();
            }
            if (!pause && lapsed > delayT) {
                grid.setNext(i, j, rules(grid.get(i, j), grid.countAdj(i, j)));
            }
        }
    }
    if (!pause && lapsed > delayT)
    {
        grid.applyNext();
        prvT = curT;
    }

    requestAnimationFrame(frame);
}

pauseBtn.addEventListener("click", e => {
    if (pause)
    {
        pause = false;
        pauseBtn.value = "pause";
    } else {
        pause = true;
        pauseBtn.value = "play";
    }
}, false);
canvas.addEventListener("mousemove", e => {
    mouse.x = e.clientX - canvas.offsetLeft;
    mouse.y = e.clientY - canvas.offsetTop;
    mouseOut.value = "x: " + highlight.i + " y: " + highlight.j + " adj: "
    + grid.countAdj(highlight.i, highlight.j);
});
canvas.addEventListener("mousedown", e => {
    if (highlight)
    {
        if (grid.get(highlight.i, highlight.j))
            grid.set(highlight.i, highlight.j, false);
        else
            grid.set(highlight.i, highlight.j, true);
    }
});

frame();
