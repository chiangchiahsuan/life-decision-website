const storyGrid = document.getElementById("storyGrid");

const defaultStories = [
    {
        reason: "當我意識到自己漸漸變老...",
        nickname: "阿月",
        text: "六十歲開始就開始在準備自己的遺囑、準備很多的事情，我那天傳預立醫療決定書給我家人的時候，我跟他們講說：人生齁！活得好，不要活得很糟糕。我不希望說以後造成任何的困擾。我覺得很好我已經很滿足了，什麼時候生命終結都沒關係。",
         createdAt: "63歲,母親"
    },
    {
        reason: "當我得知這輩子不結婚",
        nickname: "小瑗",
        text: "從我知道我不結婚之後，我就覺得說那如果有一天我要走了，我沒有用的東西都可以捐出去，大體和器官我都簽了。",
         createdAt: "53歲,女性" 
    },
    {
        reason: "不想把決策交由兒子",
        nickname: "燦燦",
        text: "我不想給我兒子做決定了，因為我爸是癌症去世的，因為我做了一些錯誤的決定，我媽媽有簽不要急救，結果我當初簽一定要急救，害了他臥床3年。我不想要讓我兒子決定，可能會讓他一直在後悔中。",
         createdAt: "53歲,病友"
        
    },
    {
        reason: "順其自然，讓生命自然流逝",
        nickname: "小文",
        text: "我是佛教徒，對我而言輪迴、來世等於換個身體、換個車子這樣子而已，所以我能夠更去接受我不用急救，不用硬去維持生命，我只是差一口氣在這樣子",
        createdAt: "50歲女兒"
    },
    {
        reason: "練習決策",
        nickname: "萊萊",
        text: "我陪著媽媽一起來ACP，我聽完以後很認同也覺得我想要做這件事情！雖然未來不確定會怎麼樣人生還長，但我至少先練習幫自己做決策，未來的事情以後再說。",
        createdAt: "23歲大學生"
    },
    {
        reason: "其他",
        nickname: "小樹",
        text: "........",
        createdAt: "....."
    }
];

function escapeHTML(str){
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderStories(){
    storyGrid.innerHTML = "";

    defaultStories.forEach(story => {
        const card = document.createElement("article");
        card.className = "story-card";

        const safeReason = escapeHTML(story.reason);
        const safeNickname = escapeHTML(story.nickname);
        const safeText = escapeHTML(story.text);
        const safeDate = escapeHTML(story.createdAt);

        card.innerHTML = `
            <div>
                <div class="story-reason">${safeReason}</div>
                <div class="story-text">${safeText}</div>
            </div>

            <div class="story-footer">
                <span>${safeNickname}｜${safeDate}</span>
            </div>
        `;

        storyGrid.appendChild(card);
    });
}

renderStories();