const canvas = document.getElementById("lifeCanvas");
const ctx = canvas.getContext("2d");

const userNameInput = document.getElementById("userName");
const currentAgeInput = document.getElementById("currentAge");
const displayTitle = document.getElementById("displayTitle");
const todayText = document.getElementById("todayText");

const pointEditor = document.getElementById("pointEditor");
const eventAgeInput = document.getElementById("eventAge");
const eventTextInput = document.getElementById("eventText");
const deletePointBtn = document.getElementById("deletePointBtn");

const undoBtn = document.getElementById("undoBtn");
const clearBtn = document.getElementById("clearBtn");
const saveBtn = document.getElementById("saveBtn");
const downloadBtn = document.getElementById("downloadBtn");
const exportJsonBtn = document.getElementById("exportJsonBtn");
const importJsonBtn = document.getElementById("importJsonBtn");
const importJsonInput = document.getElementById("importJsonInput");

let points = [];
let draggingIndex = null;
let selectedIndex = null;

const today = new Date();
todayText.textContent = `日期：${today.getFullYear()} / ${today.getMonth() + 1} / ${today.getDate()}`;

function getChartTitle(){
    const name = userNameInput.value.trim();

    if(name === ""){
        return "我的生命軌跡圖";
    }

    return `${name}的生命軌跡圖`;
}

function getCurrentAge(){
    const value = currentAgeInput.value.trim();

    if(value === ""){
        return null;
    }

    const age = Number(value);

    if(isNaN(age)){
        return null;
    }

    return Math.max(0, Math.min(120, age));
}

function resizeCanvas(){
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;

    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;

    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    drawChart();
}

function getSize(){
    return {
        w: canvas.getBoundingClientRect().width,
        h: canvas.getBoundingClientRect().height
    };
}

function chartArea(){
    const size = getSize();

    return {
        left: 80,
        right: size.w - 60,
        top: 90,
        bottom: size.h - 95
    };
}

function ageToX(age){
    const area = chartArea();
    return area.left + (age / 100) * (area.right - area.left);
}

function xToAge(x){
    const area = chartArea();
    const age = ((x - area.left) / (area.right - area.left)) * 100;
    return Math.max(0, Math.min(100, age));
}

function feelingToY(feeling){
    const area = chartArea();
    return area.bottom - (feeling / 100) * (area.bottom - area.top);
}

function yToFeeling(y){
    const area = chartArea();
    const feeling = ((area.bottom - y) / (area.bottom - area.top)) * 100;
    return Math.max(0, Math.min(100, feeling));
}

function selectPoint(index){
    selectedIndex = index;

    if(index === null){
        pointEditor.style.display = "none";
        eventAgeInput.value = "";
        eventTextInput.value = "";
        deletePointBtn.disabled = true;
    }else{
        const p = points[index];

        pointEditor.style.display = "block";
        eventAgeInput.value = p.eventAge || "";
        eventTextInput.value = p.eventText || "";
        deletePointBtn.disabled = false;
    }

    drawChart();
}

function drawWrappedText(text, x, y, maxWidth, lineHeight){
    if(!text) return;

    let line = "";
    const lines = [];

    for(let i = 0; i < text.length; i++){
        const testLine = line + text[i];
        const metrics = ctx.measureText(testLine);

        if(metrics.width > maxWidth && line !== ""){
            lines.push(line);
            line = text[i];
        }else{
            line = testLine;
        }
    }

    lines.push(line);

    lines.forEach((item, index) => {
        ctx.fillText(item, x, y + index * lineHeight);
    });
}

function buildPointLabel(p){
    const age = p.eventAge ? `${p.eventAge}歲` : "";
    const text = p.eventText ? p.eventText.trim() : "";

    if(age && text){
        return `${age}：${text}`;
    }

    if(age){
        return age;
    }

    if(text){
        return text;
    }

    return "";
}

function drawChart(){
    const size = getSize();
    const area = chartArea();
    const currentAge = getCurrentAge();

    displayTitle.textContent = getChartTitle();

    ctx.clearRect(0, 0, size.w, size.h);

    ctx.fillStyle = "#fffdf0";
    ctx.fillRect(0, 0, size.w, size.h);

    drawGrid(area);
    drawAxes(area);
    drawLabels(area, size, currentAge);
    drawNowLine(area, currentAge);
    drawPath(currentAge);
    drawPoints(area);
}

function drawGrid(area){
    ctx.strokeStyle = "rgba(108,88,76,0.12)";
    ctx.lineWidth = 1;

    for(let i = 0; i <= 5; i++){
        const y = area.top + i * (area.bottom - area.top) / 5;
        ctx.beginPath();
        ctx.moveTo(area.left, y);
        ctx.lineTo(area.right, y);
        ctx.stroke();
    }

    for(let i = 0; i <= 5; i++){
        const x = area.left + i * (area.right - area.left) / 5;
        ctx.beginPath();
        ctx.moveTo(x, area.top);
        ctx.lineTo(x, area.bottom);
        ctx.stroke();
    }
}

function drawAxes(area){
    ctx.strokeStyle = "rgba(108,88,76,1)";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(area.left, area.bottom);
    ctx.lineTo(area.right, area.bottom);
    ctx.lineTo(area.right - 12, area.bottom - 8);
    ctx.moveTo(area.right, area.bottom);
    ctx.lineTo(area.right - 12, area.bottom + 8);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(area.left, area.bottom);
    ctx.lineTo(area.left, area.top);
    ctx.lineTo(area.left - 8, area.top + 12);
    ctx.moveTo(area.left, area.top);
    ctx.lineTo(area.left + 8, area.top + 12);
    ctx.stroke();
}

function drawLabels(area, size, currentAge){
    ctx.fillStyle = "rgba(108,88,76,1)";

    ctx.font = "bold 26px Chiron GoRound TC";
    ctx.textAlign = "center";
    ctx.fillText(getChartTitle(), size.w / 2, 42);

    ctx.font = "bold 18px Chiron GoRound TC";
    ctx.textAlign = "center";
    ctx.fillText("過去", area.left + 60, area.bottom + 42);

    if(currentAge !== null){
        ctx.fillText("現在", ageToX(currentAge), area.bottom + 42);
    }

    ctx.fillText("未來", area.right - 70, area.bottom + 42);
    ctx.fillText("年齡", area.right - 5, area.bottom + 42);

    ctx.textAlign = "right";
    ctx.fillText("高", area.left - 20, area.top + 6);
    ctx.fillText("低", area.left - 20, area.bottom + 6);

    ctx.save();
    ctx.translate(area.left - 48, (area.top + area.bottom) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("幸福感", 0, 0);
    ctx.restore();
}

function drawNowLine(area, currentAge){
    if(currentAge === null) return;

    const nowX = ageToX(currentAge);

    ctx.strokeStyle = "rgba(169,132,103,0.85)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);

    ctx.beginPath();
    ctx.moveTo(nowX, area.top);
    ctx.lineTo(nowX, area.bottom);
    ctx.stroke();

    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(108,88,76,1)";
    ctx.font = "bold 17px Chiron GoRound TC";
    ctx.textAlign = "center";
    ctx.fillText("現在", nowX, area.top - 18);
}

function drawPath(currentAge){
    const sorted = [...points].sort((a, b) => a.xAge - b.xAge);

    if(sorted.length < 2) return;

    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for(let i = 0; i < sorted.length - 1; i++){
        const p1 = sorted[i];
        const p2 = sorted[i + 1];

        const x1 = ageToX(p1.xAge);
        const y1 = feelingToY(p1.feeling);
        const x2 = ageToX(p2.xAge);
        const y2 = feelingToY(p2.feeling);

        if(currentAge !== null && (p1.xAge >= currentAge || p2.xAge > currentAge)){
            ctx.setLineDash([12, 10]);
        }else{
            ctx.setLineDash([]);
        }

        ctx.strokeStyle = "rgba(108,88,76,0.95)";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    ctx.setLineDash([]);
}

function drawPoints(area){
    points.forEach((p, index) => {
        const x = ageToX(p.xAge);
        const y = feelingToY(p.feeling);

        ctx.beginPath();
        ctx.fillStyle = index === selectedIndex ? "#ff8800" : "#a98467";
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#fffdf0";
        ctx.lineWidth = 3;
        ctx.stroke();

        if(index === selectedIndex){
            ctx.strokeStyle = "rgba(255,136,0,0.35)";
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(x, y, 16, 0, Math.PI * 2);
            ctx.stroke();
        }

        const label = buildPointLabel(p);

        if(label !== ""){
            ctx.fillStyle = "rgba(108,88,76,1)";
            ctx.font = "13px Chiron GoRound TC";
            ctx.textAlign = "center";

            let textY = y + 24;

            if(y > area.bottom - 60){
                textY = y - 42;
            }

            drawWrappedText(label, x, textY, 110, 16);
        }
    });
}

function getPointerPosition(e){
    const rect = canvas.getBoundingClientRect();

    let clientX;
    let clientY;

    if(e.touches && e.touches.length > 0){
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }else{
        clientX = e.clientX;
        clientY = e.clientY;
    }

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function findPoint(pos){
    for(let i = points.length - 1; i >= 0; i--){
        const x = ageToX(points[i].xAge);
        const y = feelingToY(points[i].feeling);
        const dist = Math.hypot(pos.x - x, pos.y - y);

        if(dist < 16){
            return i;
        }
    }

    return null;
}

function addPoint(pos){
    const area = chartArea();

    if(pos.x < area.left || pos.x > area.right || pos.y < area.top || pos.y > area.bottom){
        return;
    }

    points.push({
        xAge: xToAge(pos.x),
        feeling: yToFeeling(pos.y),
        eventAge: "",
        eventText: ""
    });

    selectPoint(points.length - 1);
}

canvas.addEventListener("mousedown", function(e){
    const pos = getPointerPosition(e);
    const index = findPoint(pos);

    if(index !== null){
        selectPoint(index);
        draggingIndex = index;
    }else{
        addPoint(pos);
        draggingIndex = selectedIndex;
    }
});

canvas.addEventListener("mousemove", function(e){
    if(draggingIndex === null) return;

    const pos = getPointerPosition(e);
    const area = chartArea();

    const x = Math.max(area.left, Math.min(area.right, pos.x));
    const y = Math.max(area.top, Math.min(area.bottom, pos.y));

    points[draggingIndex].xAge = xToAge(x);
    points[draggingIndex].feeling = yToFeeling(y);

    drawChart();
});

window.addEventListener("mouseup", function(){
    draggingIndex = null;
    drawChart();
});

canvas.addEventListener("touchstart", function(e){
    e.preventDefault();

    const pos = getPointerPosition(e);
    const index = findPoint(pos);

    if(index !== null){
        selectPoint(index);
        draggingIndex = index;
    }else{
        addPoint(pos);
        draggingIndex = selectedIndex;
    }
}, {passive:false});

canvas.addEventListener("touchmove", function(e){
    e.preventDefault();

    if(draggingIndex === null) return;

    const pos = getPointerPosition(e);
    const area = chartArea();

    const x = Math.max(area.left, Math.min(area.right, pos.x));
    const y = Math.max(area.top, Math.min(area.bottom, pos.y));

    points[draggingIndex].xAge = xToAge(x);
    points[draggingIndex].feeling = yToFeeling(y);

    drawChart();
}, {passive:false});

canvas.addEventListener("touchend", function(){
    draggingIndex = null;
    drawChart();
});

eventAgeInput.addEventListener("input", function(){
    if(selectedIndex === null) return;

    points[selectedIndex].eventAge = eventAgeInput.value;
    drawChart();
});

eventTextInput.addEventListener("input", function(){
    if(selectedIndex === null) return;

    points[selectedIndex].eventText = eventTextInput.value;
    drawChart();
});

deletePointBtn.addEventListener("click", function(){
    if(selectedIndex === null) return;

    points.splice(selectedIndex, 1);
    selectPoint(null);
});

undoBtn.addEventListener("click", function(){
    points.pop();
    selectPoint(null);
    drawChart();
});

clearBtn.addEventListener("click", function(){
    if(confirm("確定要清除目前的生命軌跡圖嗎？")){
        points = [];
        selectedIndex = null;
        localStorage.removeItem("lifeTrajectoryData");
        selectPoint(null);
        drawChart();
    }
});

function makeEditableData(){
    return {
        version: "1.0",
        type: "lifeTrajectoryEditableFile",
        userName: userNameInput.value,
        currentAge: currentAgeInput.value,
        points: points,
        savedAt: new Date().toISOString()
    };
}

saveBtn.addEventListener("click", function(){
    localStorage.setItem("lifeTrajectoryData", JSON.stringify(makeEditableData()));
    alert("已暫存目前進度！若要之後換裝置或保留檔案，請下載可編輯檔。");
});

downloadBtn.addEventListener("click", function(){
    drawChart();

    const name = userNameInput.value.trim() || "我的";
    const date = new Date().toISOString().slice(0, 10);
    const link = document.createElement("a");

    link.download = `${name}的生命軌跡圖_${date}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
});

exportJsonBtn.addEventListener("click", function(){
    const data = makeEditableData();
    const jsonText = JSON.stringify(data, null, 2);

    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const name = userNameInput.value.trim() || "我的";
    const date = new Date().toISOString().slice(0, 10);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}的生命軌跡圖_可編輯檔_${date}.json`;
    link.click();

    URL.revokeObjectURL(url);
});

importJsonBtn.addEventListener("click", function(){
    importJsonInput.click();
});

importJsonInput.addEventListener("change", function(e){
    const file = e.target.files[0];

    if(!file){
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event){
        try{
            const data = JSON.parse(event.target.result);

            if(!data.points || !Array.isArray(data.points)){
                alert("這個檔案格式不正確，無法匯入。");
                return;
            }

            userNameInput.value = data.userName || "";
            currentAgeInput.value = data.currentAge || "";

            points = data.points.map(p => {
                return {
                    xAge: p.xAge !== undefined ? p.xAge : 0,
                    feeling: p.feeling !== undefined ? p.feeling : 50,
                    eventAge: p.eventAge || "",
                    eventText: p.eventText || ""
                };
            });

            localStorage.setItem("lifeTrajectoryData", JSON.stringify(makeEditableData()));

            selectedIndex = null;
            draggingIndex = null;
            selectPoint(null);
            drawChart();

            alert("已成功匯入，可以繼續編輯！");
        }catch(error){
            alert("匯入失敗，請確認檔案是否為本網站下載的可編輯檔。");
        }

        importJsonInput.value = "";
    };

    reader.readAsText(file);
});

currentAgeInput.addEventListener("input", drawChart);
userNameInput.addEventListener("input", drawChart);

function loadData(){
    const saved = localStorage.getItem("lifeTrajectoryData");

    if(saved){
        try{
            const data = JSON.parse(saved);

            points = data.points || [];
            currentAgeInput.value = data.currentAge || "";
            userNameInput.value = data.userName || "";

            points = points.map(p => {
                return {
                    xAge: p.xAge !== undefined ? p.xAge : (p.age !== undefined ? p.age : 0),
                    feeling: p.feeling !== undefined ? p.feeling : 50,
                    eventAge: p.eventAge || "",
                    eventText: p.eventText || p.event || ""
                };
            });
        }catch(error){
            points = [];
            currentAgeInput.value = "";
            userNameInput.value = "";
        }
    }else{
        points = [];
        currentAgeInput.value = "";
        userNameInput.value = "";
    }

    selectPoint(null);
    resizeCanvas();
}

window.addEventListener("resize", resizeCanvas);
loadData();