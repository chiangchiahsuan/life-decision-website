// 生命樹牌卡遊戲 JS

// 預設關係牌卡
const relationCards = [
    { name: "爸爸", category: "cat-family" },
    { name: "媽媽", category: "cat-family" },
    { name: "哥哥", category: "cat-family" },
    { name: "姊姊", category: "cat-family" },
    { name: "弟弟", category: "cat-family" },
    { name: "妹妹", category: "cat-family" },

    { name: "丈夫", category: "cat-partner" },
    { name: "妻子", category: "cat-partner" },
    { name: "伴侶", category: "cat-partner" },
    { name: "男朋友", category: "cat-partner" },
    { name: "女朋友", category: "cat-partner" },

    { name: "兒子", category: "cat-children" },
    { name: "女兒", category: "cat-children" },
    { name: "媳婦", category: "cat-children" },
    { name: "女婿", category: "cat-children" },

    { name: "爺爺", category: "cat-relative" },
    { name: "奶奶", category: "cat-relative" },
    { name: "外公", category: "cat-relative" },
    { name: "外婆", category: "cat-relative" },
    { name: "孫子", category: "cat-relative" },
    { name: "孫女", category: "cat-relative" },
    { name: "姪子", category: "cat-relative" },
    { name: "姪女", category: "cat-relative" },
    { name: "外甥", category: "cat-relative" },
    { name: "外甥女", category: "cat-relative" },
    { name: "叔叔", category: "cat-relative" },
    { name: "伯伯", category: "cat-relative" },
    { name: "阿姨", category: "cat-relative" },
    { name: "姑姑", category: "cat-relative" },
    { name: "舅舅", category: "cat-relative" },
    { name: "堂兄弟姊妹", category: "cat-relative" },
    { name: "表兄弟姊妹", category: "cat-relative" },

    { name: "朋友", category: "cat-friend" },
    { name: "好朋友", category: "cat-friend" },
    { name: "同事", category: "cat-friend" },
    { name: "鄰居", category: "cat-friend" },
    { name: "老師", category: "cat-friend" },
    { name: "同學", category: "cat-friend" },
    { name: "志工", category: "cat-friend" },

    { name: "醫師", category: "cat-professional" },
    { name: "護理師", category: "cat-professional" },
    { name: "社工師", category: "cat-professional" },
    { name: "心理師", category: "cat-professional" },
    { name: "宗教師", category: "cat-professional" },
    { name: "照顧服務員", category: "cat-professional" },
    { name: "外籍看護", category: "cat-professional" },
    { name: "個案管理師", category: "cat-professional" },

    { name: "自己", category: "cat-self" },
    { name: "沒有人", category: "cat-self" },
    { name: "其他", category: "cat-self" }
];

// 五個層次名稱
const layerTitles = {
    layer1: "第一層次：生命中對你而言重要的人有哪些？",
    layer2: "第二層次：當你有開心的事情，你會想與誰分享？",
    layer3: "第三層次：當你生命中遇到困難或重要事情時，你會與誰說？",
    layer4: "第四層次：當你面對生命末期的醫療決策時，你會希望與誰討論？",
    layer5: "第五層次：你會希望誰替你決策生命末期相關事宜？"
};

let selectedCard = null;
const storageKey = "lifeTreeCardResult";

// 初始化
document.addEventListener("DOMContentLoaded", function(){
    createDefaultCards();
    setupDropZones();
    setupButtons();
    loadSavedResult();
    renderCaptureContent();
});

// 建立預設牌卡
function createDefaultCards(){
    const cardBank = document.getElementById("cardBank");

    relationCards.forEach(function(item){
        const card = createRelationCard(item.name, item.category);
        cardBank.appendChild(card);
    });
}

// 建立一張牌卡
function createRelationCard(name, category){
    const card = document.createElement("div");
    card.className = "relation-card " + category;
    card.textContent = name;
    card.setAttribute("draggable", "true");
    card.setAttribute("data-name", name);
    card.setAttribute("data-category", category);

    // 桌機拖曳
    card.addEventListener("dragstart", function(event){
        const cardData = JSON.stringify({
            name: name,
            category: category
        });

        event.dataTransfer.setData("text/plain", cardData);
    });

    // 手機 / 平板點選
    card.addEventListener("click", function(){
        document.querySelectorAll(".relation-card").forEach(function(item){
            item.classList.remove("selected");
        });

        selectedCard = {
            name: name,
            category: category
        };

        card.classList.add("selected");
    });

    return card;
}

// 設定拖放區
function setupDropZones(){
    const dropZones = document.querySelectorAll(".drop-zone");

    dropZones.forEach(function(zone){

        zone.addEventListener("dragover", function(event){
            event.preventDefault();
            zone.classList.add("drag-over");
        });

        zone.addEventListener("dragleave", function(){
            zone.classList.remove("drag-over");
        });

        zone.addEventListener("drop", function(event){
            event.preventDefault();
            zone.classList.remove("drag-over");

            const rawData = event.dataTransfer.getData("text/plain");

            if(rawData){
                try{
                    const cardData = JSON.parse(rawData);
                    addChipToZone(zone, cardData.name, cardData.category);
                    autoSaveResult();
                    renderCaptureContent();
                }catch(error){
                    console.log("拖曳資料格式錯誤");
                }
            }
        });

        // 手機版點選放入
        zone.addEventListener("click", function(){
            if(selectedCard){
                addChipToZone(zone, selectedCard.name, selectedCard.category);
                autoSaveResult();
                renderCaptureContent();

                selectedCard = null;

                document.querySelectorAll(".relation-card").forEach(function(item){
                    item.classList.remove("selected");
                });
            }
        });
    });
}

// 加入已選小牌卡
function addChipToZone(zone, name, category){

    // 避免同一層重複放入同一個人
    const existing = Array.from(zone.querySelectorAll(".selected-chip"))
        .map(function(item){
            return item.getAttribute("data-name");
        });

    if(existing.includes(name)){
        return;
    }

    const chip = document.createElement("div");
    chip.className = "selected-chip " + category;
    chip.setAttribute("data-name", name);
    chip.setAttribute("data-category", category);

    const text = document.createElement("span");
    text.textContent = name;

    const remove = document.createElement("span");
    remove.className = "remove-chip";
    remove.textContent = "×";
    remove.setAttribute("title", "移除");

    remove.addEventListener("click", function(event){
        event.stopPropagation();
        chip.remove();
        autoSaveResult();
        renderCaptureContent();
        document.getElementById("resultText").value = buildResultText();
    });

    chip.appendChild(text);
    chip.appendChild(remove);
    zone.appendChild(chip);
}

// 設定按鈕
function setupButtons(){

    const addCustomBtn = document.getElementById("addCustomBtn");
    const customInput = document.getElementById("customInput");
    const cardBank = document.getElementById("cardBank");

    // 新增自訂牌卡
    addCustomBtn.addEventListener("click", function(){
        addCustomCard();
    });

    customInput.addEventListener("keydown", function(event){
        if(event.key === "Enter"){
            addCustomCard();
        }
    });

    function addCustomCard(){
        const value = customInput.value.trim();

        if(value === ""){
            return;
        }

        const card = createRelationCard(value, "cat-self");
        cardBank.prepend(card);

        customInput.value = "";
    }

    // 整理結果
    document.getElementById("showResultBtn").addEventListener("click", function(){
        const resultText = buildResultText();
        document.getElementById("resultText").value = resultText;
        renderCaptureContent();
    });

    // 儲存結果
    document.getElementById("saveResultBtn").addEventListener("click", function(){
        autoSaveResult();
        document.getElementById("resultText").value = buildResultText();
        renderCaptureContent();
        alert("已儲存您的生命樹牌卡結果。下次使用同一台裝置開啟此頁時，會自動保留。");
    });

    // 複製結果
    document.getElementById("copyResultBtn").addEventListener("click", function(){
        const resultBox = document.getElementById("resultText");

        if(resultBox.value.trim() === ""){
            resultBox.value = buildResultText();
            renderCaptureContent();
        }

        resultBox.select();
        document.execCommand("copy");

        alert("已複製您的選擇結果");
    });

    // 下載圖片
    document.getElementById("downloadImageBtn").addEventListener("click", function(){
        renderCaptureContent();

        const captureArea = document.getElementById("captureArea");

        html2canvas(captureArea, {
            backgroundColor: "#fffaf0",
            scale: 2,
            useCORS: true
        }).then(function(canvas){
            const link = document.createElement("a");
            link.download = "生命樹牌卡結果.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
        });
    });

    // 清除
    document.getElementById("clearBtn").addEventListener("click", function(){
        const confirmClear = confirm("確定要重新選擇嗎？目前放入生命樹中的牌卡會被清除。");

        if(confirmClear){
            document.querySelectorAll(".drop-zone").forEach(function(zone){
                zone.innerHTML = "";
            });

            document.getElementById("resultText").value = "";
            document.getElementById("captureContent").innerHTML = "";

            localStorage.removeItem(storageKey);

            selectedCard = null;

            document.querySelectorAll(".relation-card").forEach(function(item){
                item.classList.remove("selected");
            });

            renderCaptureContent();
        }
    });
}

// 建立文字結果
function buildResultText(){
    let result = "我的生命樹牌卡選擇結果\n";
    result += "填寫日期：" + getTodayDate() + "\n";
    result += "========================\n\n";

    Object.keys(layerTitles).forEach(function(layerKey){
        const zone = document.querySelector('.drop-zone[data-layer="' + layerKey + '"]');
        const chips = zone.querySelectorAll(".selected-chip");

        const names = Array.from(chips).map(function(chip){
            return chip.getAttribute("data-name");
        });

        result += layerTitles[layerKey] + "\n";

        if(names.length > 0){
            result += "我選擇的人：" + names.join("、") + "\n\n";
        }else{
            result += "我選擇的人：尚未選擇\n\n";
        }
    });

    return result;
}

// 產生圖片輸出內容
function renderCaptureContent(){
    const captureContent = document.getElementById("captureContent");
    const captureDate = document.getElementById("captureDate");

    if(!captureContent){
        return;
    }

    if(captureDate){
        captureDate.textContent = "填寫日期：" + getTodayDate();
    }

    captureContent.innerHTML = "";

    Object.keys(layerTitles).forEach(function(layerKey){
        const zone = document.querySelector('.drop-zone[data-layer="' + layerKey + '"]');
        const chips = zone.querySelectorAll(".selected-chip");

        const block = document.createElement("div");
        block.className = "capture-block";

        const title = document.createElement("h4");
        title.textContent = layerTitles[layerKey];
        block.appendChild(title);

        const chipList = document.createElement("div");
        chipList.className = "capture-chip-list";

        if(chips.length > 0){
            chips.forEach(function(chip){
                const name = chip.getAttribute("data-name");
                const category = chip.getAttribute("data-category");

                const item = document.createElement("div");
                item.className = "capture-chip " + category;
                item.textContent = name;

                chipList.appendChild(item);
            });
        }else{
            const empty = document.createElement("div");
            empty.className = "capture-empty";
            empty.textContent = "尚未選擇";
            chipList.appendChild(empty);
        }

        block.appendChild(chipList);
        captureContent.appendChild(block);
    });
}

// 自動儲存到 localStorage
function autoSaveResult(){
    const savedData = {};

    Object.keys(layerTitles).forEach(function(layerKey){
        const zone = document.querySelector('.drop-zone[data-layer="' + layerKey + '"]');
        const chips = zone.querySelectorAll(".selected-chip");

        savedData[layerKey] = Array.from(chips).map(function(chip){
            return {
                name: chip.getAttribute("data-name"),
                category: chip.getAttribute("data-category")
            };
        });
    });

    localStorage.setItem(storageKey, JSON.stringify(savedData));
}

// 載入已儲存結果
function loadSavedResult(){
    const saved = localStorage.getItem(storageKey);

    if(!saved){
        return;
    }

    try{
        const savedData = JSON.parse(saved);

        Object.keys(savedData).forEach(function(layerKey){
            const zone = document.querySelector('.drop-zone[data-layer="' + layerKey + '"]');

            if(zone && Array.isArray(savedData[layerKey])){
                savedData[layerKey].forEach(function(item){
                    addChipToZone(zone, item.name, item.category);
                });
            }
        });

        document.getElementById("resultText").value = buildResultText();

    }catch(error){
        console.log("讀取儲存資料失敗");
    }
}

// 取得今天日期
function getTodayDate(){
    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();

    return year + "年" + month + "月" + date + "日";
}