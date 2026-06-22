const STORAGE_KEY = "futurePreparationFormData";

const userNameInput = document.getElementById("userName");
const resultTitle = document.getElementById("resultTitle");
const todayText = document.getElementById("todayText");

const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const sideProgressText = document.getElementById("sideProgressText");

const saveBtn = document.getElementById("saveBtn");
const downloadImageBtn = document.getElementById("downloadImageBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const importInput = document.getElementById("importInput");

const questionCards = document.querySelectorAll(".question-card");

const sections = [
    { key: "medical", title: "醫療準備", radioName: "medical", noteId: "medicalNote" },
    { key: "finance", title: "財務準備", radioName: "finance", noteId: "financeNote" },
    { key: "oldPlace", title: "老後照顧地點", radioName: "oldPlace", noteId: "oldPlaceNote" },
    { key: "lastPlace", title: "最後一口氣", radioName: "lastPlace", noteId: "lastPlaceNote" },
    { key: "funeral", title: "告別與喪禮準備", radioName: "funeral", noteId: "funeralNote" },
    { key: "words", title: "想說的話", radioName: "words", noteId: "wordsNote" },
    { key: "proxy", title: "重要代理人／決策支持者", radioName: "proxy", noteId: "proxyNote" }
];


let data = {
userName: "",
responses: {}
};

function setToday(){
const today = new Date();
todayText.textContent = `日期：${today.getFullYear()} / ${today.getMonth() + 1} / ${today.getDate()}`;
}

function updateTitle(){
const name = userNameInput.value.trim();
data.userName = name;


if(name === ""){
    resultTitle.textContent = "我的未來準備表";
}else{
    resultTitle.textContent = `${name}的未來準備表`;
}

}

function getSelectedRadioValue(name){
const checked = document.querySelector(`input[name="${name}"]:checked`);


if(!checked){
    return "";
}

return checked.value;


}

function setRadioValue(name, value){
const radios = document.querySelectorAll(`input[name="${name}"]`);


radios.forEach(radio => {
    radio.checked = radio.value === value;
});


}

function collectData(){
updateTitle();


sections.forEach(section => {
    const selectedValue = getSelectedRadioValue(section.radioName);
    const noteInput = document.getElementById(section.noteId);
    const note = noteInput ? noteInput.value.trim() : "";

    data.responses[section.key] = {
        selected: selectedValue,
        note: note
    };
});

}

function fillFormFromData(){
userNameInput.value = data.userName || "";
updateTitle();


sections.forEach(section => {
    const response = data.responses[section.key] || {};

    setRadioValue(section.radioName, response.selected || "");

    const noteInput = document.getElementById(section.noteId);

    if(noteInput){
        noteInput.value = response.note || "";
    }
});

updateProgress();


}

function isSectionCompleted(section){
const selectedValue = getSelectedRadioValue(section.radioName);
const noteInput = document.getElementById(section.noteId);
const note = noteInput ? noteInput.value.trim() : "";


return selectedValue !== "" || note !== "";


}

function updateProgress(){
let completedCount = 0;


sections.forEach(section => {
    if(isSectionCompleted(section)){
        completedCount++;
    }
});

const percent = Math.round((completedCount / sections.length) * 100);

progressText.textContent = `完成進度：${completedCount} / ${sections.length}`;
sideProgressText.textContent = `目前完成 ${completedCount} 題`;
progressFill.style.width = `${percent}%`;

questionCards.forEach(card => {
    const key = card.dataset.section;
    const section = sections.find(item => item.key === key);

    if(section && isSectionCompleted(section)){
        card.classList.add("completed");
    }else{
        card.classList.remove("completed");
    }
});


}

function saveToLocal(showAlert = true){
collectData();
localStorage.setItem(STORAGE_KEY, JSON.stringify(data));


if(showAlert){
    alert("已暫存目前進度！若要跨裝置或之後繼續編輯，請下載可編輯檔。");
}


}

function loadFromLocal(){
const saved = localStorage.getItem(STORAGE_KEY);


if(saved && confirm("偵測到先前暫存的填寫內容，是否要載入繼續編輯？")){
    try{
        data = JSON.parse(saved);
    }catch(error){
        data = {
            userName: "",
            responses: {}
        };
    }

    fillFormFromData();
}else{
    data = {
        userName: "",
        responses: {}
    };

    userNameInput.value = "";
    updateTitle();
    updateProgress();
}


}

function clearAll(){
if(!confirm("確定要清除全部填寫內容嗎？")){
return;
}


data = {
    userName: "",
    responses: {}
};

localStorage.removeItem(STORAGE_KEY);

sections.forEach(section => {
    setRadioValue(section.radioName, "");

    const noteInput = document.getElementById(section.noteId);

    if(noteInput){
        noteInput.value = "";
    }
});

userNameInput.value = "";
updateTitle();
updateProgress();


}

function exportEditableFile(){
collectData();


const exportData = {
    version: "1.0",
    type: "futurePreparationFormEditableFile",
    data: data,
    savedAt: new Date().toISOString()
};

const jsonText = JSON.stringify(exportData, null, 2);
const blob = new Blob([jsonText], { type: "application/json" });
const url = URL.createObjectURL(blob);

const name = data.userName || "我的";
const date = new Date().toISOString().slice(0, 10);

const link = document.createElement("a");
link.href = url;
link.download = `${name}的未來準備表_可編輯檔_${date}.json`;
link.click();

URL.revokeObjectURL(url);


}

function importEditableFile(file){
const reader = new FileReader();


reader.onload = function(event){
    try{
        const imported = JSON.parse(event.target.result);

        if(!imported.data || imported.type !== "futurePreparationFormEditableFile"){
            alert("這個檔案格式不正確，無法匯入。");
            return;
        }

        data = imported.data;
        fillFormFromData();
        saveToLocal(false);

        alert("已成功匯入，可以繼續編輯！");
    }catch(error){
        alert("匯入失敗，請確認檔案是否為本網站下載的可編輯檔。");
    }

    importInput.value = "";
};

reader.readAsText(file);


}

function downloadImage(){
collectData();


const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1400;
canvas.height = 1900;

ctx.fillStyle = "#f0ead2";
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = "#fefae0";
roundRect(ctx, 70, 60, 1260, 1780, 44);
ctx.fill();

ctx.fillStyle = "rgba(108,88,76,1)";
ctx.textAlign = "center";
ctx.font = "bold 56px Chiron GoRound TC, sans-serif";
ctx.fillText(resultTitle.textContent, canvas.width / 2, 140);

const today = new Date();
ctx.font = "28px Chiron GoRound TC, sans-serif";
ctx.fillText(`日期：${today.getFullYear()} / ${today.getMonth() + 1} / ${today.getDate()}`, canvas.width / 2, 190);

let y = 270;

sections.forEach((section, index) => {
    const response = data.responses[section.key] || {};
    const selected = response.selected || "尚未選擇";
    const note = response.note || "尚未填寫補充想法";

    ctx.fillStyle = "rgba(204,213,174,0.45)";
    roundRect(ctx, 130, y - 35, 1140, 150, 28);
    ctx.fill();

    ctx.fillStyle = "rgba(108,88,76,1)";
    ctx.textAlign = "left";
    ctx.font = "bold 30px Chiron GoRound TC, sans-serif";
    ctx.fillText(`${String(index + 1).padStart(2, "0")}｜${section.title}`, 165, y);

    ctx.font = "24px Chiron GoRound TC, sans-serif";
    ctx.fillText(`選擇：${selected}`, 165, y + 42);

    ctx.font = "22px Chiron GoRound TC, sans-serif";
    y = drawWrappedCanvasText(ctx, `補充：${note}`, 165, y + 82, 1040, 30);

    y += 55;
});

const name = data.userName || "我的";
const date = new Date().toISOString().slice(0, 10);

const link = document.createElement("a");
link.download = `${name}的未來準備表_${date}.png`;
link.href = canvas.toDataURL("image/png");
link.click();


}

function drawWrappedCanvasText(ctx, text, x, y, maxWidth, lineHeight){
let line = "";


for(let i = 0; i < text.length; i++){
    const testLine = line + text[i];

    if(ctx.measureText(testLine).width > maxWidth && line !== ""){
        ctx.fillText(line, x, y);
        line = text[i];
        y += lineHeight;
    }else{
        line = testLine;
    }
}

ctx.fillText(line, x, y);
return y + lineHeight;


}

function roundRect(ctx, x, y, width, height, radius){
ctx.beginPath();
ctx.moveTo(x + radius, y);
ctx.lineTo(x + width - radius, y);
ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
ctx.lineTo(x + width, y + height - radius);
ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
ctx.lineTo(x + radius, y + height);
ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
ctx.lineTo(x, y + radius);
ctx.quadraticCurveTo(x, y, x + radius, y);
ctx.closePath();
}

document.querySelectorAll("input, textarea").forEach(input => {
input.addEventListener("input", function(){
collectData();
updateProgress();
});


input.addEventListener("change", function(){
    collectData();
    updateProgress();
});


});

userNameInput.addEventListener("input", function(){
updateTitle();
});

saveBtn.addEventListener("click", function(){
saveToLocal(true);
});

downloadImageBtn.addEventListener("click", downloadImage);
exportBtn.addEventListener("click", exportEditableFile);

importBtn.addEventListener("click", function(){
importInput.click();
});

importInput.addEventListener("change", function(e){
const file = e.target.files[0];


if(file){
    importEditableFile(file);
}


});

clearAllBtn.addEventListener("click", clearAll);

setToday();
loadFromLocal();
