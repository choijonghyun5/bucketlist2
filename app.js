/* =======================================================
   Bucket App v0.2
   app.js - Part 1
======================================================= */

const STORAGE_KEY = "bucket_v02";

let buckets = [];
let editingId = null;
let currentCategory = "전체";
let sortMode = "latest";

const quotes = [
    "오늘의 작은 한 걸음이 내일의 큰 변화를 만듭니다.",
    "꿈은 적는 순간 목표가 됩니다.",
    "시작이 가장 어려운 법입니다.",
    "포기하지 않는 사람이 결국 이깁니다.",
    "지금이 가장 젊은 순간입니다.",
    "하고 싶은 일은 미루지 마세요.",
    "매일 1%씩 성장하면 충분합니다.",
    "오늘을 후회 없이 살아보세요."
];

/* ============================= */

const pages = document.querySelectorAll(".page");

const navButtons = document.querySelectorAll(".navButton");

const bucketList = document.getElementById("bucketList");

const searchInput = document.getElementById("searchInput");

const categoryButtons =
document.querySelectorAll(".category");

const addButton =
document.getElementById("addButton");

const bucketModal =
document.getElementById("bucketModal");

const saveButton =
document.getElementById("saveButton");

const cancelButton =
document.getElementById("cancelButton");

const titleInput =
document.getElementById("titleInput");

const memoInput =
document.getElementById("memoInput");

const categoryInput =
document.getElementById("categoryInput");

const dateInput =
document.getElementById("dateInput");

const starInput =
document.getElementById("starInput");

const progressCircle =
document.getElementById("progressCircle");

const progressPercent =
document.getElementById("progressPercent");

const totalCount =
document.getElementById("totalCount");

const doneCount =
document.getElementById("doneCount");

const remainCount =
document.getElementById("remainCount");

const todayDate =
document.getElementById("todayDate");

const todayQuote =
document.getElementById("todayQuote");

const recentBuckets =
document.getElementById("recentBuckets");

const toggleTheme =
document.getElementById("toggleTheme");

const themeButton =
document.getElementById("themeButton");

const exportButton =
document.getElementById("exportButton");

const importButton =
document.getElementById("importButton");

const importFile =
document.getElementById("importFile");

const deleteAllButton =
document.getElementById("deleteAllButton");

/* ============================= */

function todayString(){

    const now=new Date();

    const week=["일","월","화","수","목","금","토"];

    return `${now.getFullYear()}년 ${now.getMonth()+1}월 ${now.getDate()}일 (${week[now.getDay()]})`;

}

todayDate.textContent=todayString();

todayQuote.textContent=
quotes[
Math.floor(
Math.random()*quotes.length
)
];

/* ============================= */

function saveStorage(){

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(buckets)
    );

}

function loadStorage(){

    const data=
    localStorage.getItem(STORAGE_KEY);

    if(data){

        buckets=JSON.parse(data);

    }

}

/* ============================= */

function openModal(){

    bucketModal.classList.add("show");

}

function closeModal(){

    bucketModal.classList.remove("show");

}

addButton.onclick=()=>{

    editingId=null;

    titleInput.value="";

    memoInput.value="";

    categoryInput.value="여행";

    dateInput.value="";

    starInput.value="false";

    document.getElementById("modalTitle").textContent=
    "새 버킷리스트";

    openModal();

};

cancelButton.onclick=closeModal;

bucketModal.onclick=e=>{

    if(e.target===bucketModal){

        closeModal();

    }

};

/* ============================= */

saveButton.onclick=()=>{

    const title=
    titleInput.value.trim();

    if(title===""){

        alert("제목을 입력해주세요.");

        return;

    }

    const bucket={

        id:
        editingId ??
        Date.now(),

        title,

        memo:
        memoInput.value.trim(),

        category:
        categoryInput.value,

        date:
        dateInput.value,

        star:
        starInput.value==="true",

        completed:false,

        created:
        Date.now()

    };

    if(editingId){

        const index=
        buckets.findIndex(
        b=>b.id===editingId
        );

        bucket.completed=
        buckets[index].completed;

        bucket.created=
        buckets[index].created;

        buckets[index]=bucket;

    }else{

        buckets.push(bucket);

    }

    saveStorage();

    closeModal();

    render();

};

/* =======================================================
   app.js - Part 2
======================================================= */

function getDday(date){

    if(!date) return "날짜 없음";

    const today = new Date();
    today.setHours(0,0,0,0);

    const target = new Date(date);

    const diff =
    Math.ceil(
    (target-today)/(1000*60*60*24)
    );

    if(diff>0) return `D-${diff}`;

    if(diff===0) return "D-Day";

    return `D+${Math.abs(diff)}`;

}

/* ============================= */

function updateStats(){

    const total=buckets.length;

    const done=
    buckets.filter(
    b=>b.completed
    ).length;

    const remain=
    total-done;

    totalCount.textContent=total;

    doneCount.textContent=done;

    remainCount.textContent=remain;

    const percent=
    total===0
    ?0
    :Math.round(done/total*100);

    progressPercent.textContent=
    percent+"%";

    progressCircle.style.background=
    `conic-gradient(
        var(--blue)
        ${percent*3.6}deg,
        #DFE7F3
        0deg
    )`;

}

/* ============================= */

function renderRecent(){

    recentBuckets.innerHTML="";

    const latest=[...buckets]

    .sort((a,b)=>b.created-a.created)

    .slice(0,3);

    if(latest.length===0){

        recentBuckets.innerHTML=

        `<p style="color:var(--sub);">

        아직 목표가 없습니다.

        </p>`;

        return;

    }

    latest.forEach(item=>{

        const div=
        document.createElement("div");

        div.className="recentItem";

        div.innerHTML=`

            <div>

                <div class="recentTitle">

                    ${item.title}

                </div>

                <div class="recentDate">

                    ${getDday(item.date)}

                </div>

            </div>

            <div>

                ${item.star?"⭐":""}

            </div>

        `;

        recentBuckets.appendChild(div);

    });

}

/* ============================= */

function render(){

    let list=[...buckets];

    const keyword=
    searchInput.value
    .trim()
    .toLowerCase();

    if(currentCategory!=="전체"){

        list=list.filter(

        b=>b.category===currentCategory

        );

    }

    if(keyword){

        list=list.filter(b=>

        b.title
        .toLowerCase()
        .includes(keyword)

        ||

        b.memo
        .toLowerCase()
        .includes(keyword)

        );

    }

    if(sortMode==="latest"){

        list.sort(

        (a,b)=>

        b.created-a.created

        );

    }

    if(sortMode==="star"){

        list.sort(

        (a,b)=>

        Number(b.star)-Number(a.star)

        );

    }

    bucketList.innerHTML="";

    if(list.length===0){

        bucketList.innerHTML=

        `<div class="empty">

        버킷리스트가 없습니다.

        </div>`;

        updateStats();

        renderRecent();

        return;

    }

    list.forEach(item=>{

        const card=

        document.createElement("div");

        card.className=

        `bucketCard
        ${item.completed?"completed":""}`;

        card.innerHTML=`

<div class="bucketHeader">

<div class="bucketTitle">

${item.title}

</div>

<div class="bucketStar">

${item.star?"⭐":"☆"}

</div>

</div>

<div class="bucketTags">

<div class="tag">

${item.category}

</div>

<div class="tag">

${getDday(item.date)}

</div>

</div>

<div class="bucketMemo">

${item.memo||"메모 없음"}

</div>

<div class="bucketButtons">

<button
class="completeButton">

${item.completed?"취소":"완료"}

</button>

<button
class="editButton">

수정

</button>

<button
class="deleteButton">

삭제

</button>

</div>

`;

        bucketList.appendChild(card);

        /* 완료 */

        card
        .querySelector(".completeButton")
        .onclick=()=>{

            item.completed=

            !item.completed;

            saveStorage();

            render();

        };

        /* 삭제 */

        card
        .querySelector(".deleteButton")
        .onclick=()=>{

            if(confirm("삭제하시겠습니까?")){

                buckets=

                buckets.filter(

                b=>b.id!==item.id

                );

                saveStorage();

                render();

            }

        };

        /* 수정 */

        card
        .querySelector(".editButton")
        .onclick=()=>{

            editingId=item.id;

            titleInput.value=item.title;

            memoInput.value=item.memo;

            categoryInput.value=item.category;

            dateInput.value=item.date;

            starInput.value=item.star;

            document.getElementById("modalTitle").textContent=

            "버킷 수정";

            openModal();

        };

    });

    updateStats();

    renderRecent();

}

/* =======================================================
   app.js - Part 3
======================================================= */

/* ============================= */
/* 페이지 전환 */
/* ============================= */

function showPage(pageId){

    pages.forEach(page=>{

        page.classList.remove("active");

    });

    document
    .getElementById(pageId)
    .classList
    .add("active");

    navButtons.forEach(btn=>{

        btn.classList.remove("active");

        if(btn.dataset.page===pageId){

            btn.classList.add("active");

        }

    });

}

navButtons.forEach(button=>{

    button.onclick=()=>{

        showPage(button.dataset.page);

        if(button.dataset.page==="statsPage"){

            renderStats();

        }

    };

});

/* ============================= */
/* 검색 */
/* ============================= */

searchInput.addEventListener(

    "input",

    render

);

/* ============================= */
/* 카테고리 */
/* ============================= */

categoryButtons.forEach(button=>{

    button.onclick=()=>{

        categoryButtons.forEach(btn=>

            btn.classList.remove("active")

        );

        button.classList.add("active");

        currentCategory=

        button.dataset.category;

        render();

    };

});

/* ============================= */
/* 정렬 */
/* ============================= */

document
.getElementById("sortButton")
.onclick=()=>{

    if(sortMode==="latest"){

        sortMode="star";

        alert("⭐ 중요도순 정렬");

    }else{

        sortMode="latest";

        alert("🕒 최신순 정렬");

    }

    render();

};

/* ============================= */
/* 다크모드 */
/* ============================= */

function applyTheme(){

    const mode=

    localStorage.getItem(

    "bucket_theme"

    );

    if(mode==="dark"){

        document.body.classList.add("dark");

        themeButton.textContent="☀️";

    }

}

toggleTheme.onclick=

themeButton.onclick=()=>{

    document.body.classList.toggle("dark");

    if(

    document.body.classList.contains("dark")

    ){

        localStorage.setItem(

        "bucket_theme",

        "dark"

        );

        themeButton.textContent="☀️";

    }else{

        localStorage.setItem(

        "bucket_theme",

        "light"

        );

        themeButton.textContent="🌙";

    }

};

/* ============================= */
/* JSON 백업 */
/* ============================= */

exportButton.onclick=()=>{

    const data=

    JSON.stringify(

    buckets,

    null,

    2

    );

    const blob=

    new Blob(

    [data],

    {

        type:"application/json"

    }

    );

    const url=

    URL.createObjectURL(blob);

    const a=

    document.createElement("a");

    a.href=url;

    a.download="bucket-backup.json";

    a.click();

    URL.revokeObjectURL(url);

};

/* ============================= */
/* JSON 가져오기 */
/* ============================= */

importButton.onclick=()=>{

    importFile.click();

};

importFile.onchange=e=>{

    const file=

    e.target.files[0];

    if(!file) return;

    const reader=

    new FileReader();

    reader.onload=()=>{

        try{

            buckets=

            JSON.parse(

            reader.result

            );

            saveStorage();

            render();

            alert("가져오기 완료");

        }

        catch{

            alert("올바른 JSON 파일이 아닙니다.");

        }

    };

    reader.readAsText(file);

};

/* ============================= */
/* 전체 삭제 */
/* ============================= */

deleteAllButton.onclick=()=>{

    if(

    confirm(

    "모든 버킷을 삭제하시겠습니까?"

    )

    ){

        buckets=[];

        saveStorage();

        render();

    }

};

/* ============================= */
/* 통계 */
/* ============================= */

function renderStats(){

    const container=

    document.getElementById(

    "statsContainer"

    );

    container.innerHTML="";

    const total=buckets.length;

    const done=

    buckets.filter(

    b=>b.completed

    ).length;

    const percent=

    total===0

    ?0

    :Math.round(

    done/total*100

    );

    const card=

    document.createElement("div");

    card.className="statsCard";

    card.innerHTML=`

<h3>

전체 달성률

</h3>

<div class="chartBar">

<div
class="chartFill"
style="width:${percent}%">

</div>

</div>

<p
style="margin-top:16px;">

${percent}% 완료

</p>

`;

    container.appendChild(card);

        /* ============================= */
    /* 카테고리 통계 */
    /* ============================= */

    const categories = {};

    buckets.forEach(bucket => {

        categories[bucket.category] =
            (categories[bucket.category] || 0) + 1;

    });

    Object.keys(categories).forEach(category => {

        const percent =
            total === 0
            ? 0
            : Math.round(categories[category] / total * 100);

        const card = document.createElement("div");

        card.className = "statsCard";

        card.innerHTML = `

            <h3>${category}</h3>

            <div class="chartBar">

                <div
                    class="chartFill"
                    style="width:${percent}%">
                </div>

            </div>

            <p style="margin-top:14px;">

                ${categories[category]}개 (${percent}%)

            </p>

        `;

        container.appendChild(card);

    });

}

/* ============================= */
/* 최초 실행 */
/* ============================= */

function init(){

    loadStorage();

    applyTheme();

    render();

}

init();

/* ============================= */
/* ESC 키 */
/* ============================= */

window.addEventListener(

    "keydown",

    e=>{

        if(e.key==="Escape"){

            closeModal();

        }

    }

);

/* ============================= */
/* 모바일에서 모달 바깥 클릭 */
/* ============================= */

bucketModal.addEventListener(

    "click",

    e=>{

        if(e.target===bucketModal){

            closeModal();

        }

    }

);

/* ============================= */
/* iOS Safari 화면 높이 보정 */
/* ============================= */

function setViewportHeight(){

    document.documentElement.style.setProperty(

        "--vh",

        `${window.innerHeight*0.01}px`

    );

}

window.addEventListener(

    "resize",

    setViewportHeight

);

setViewportHeight();

/* ============================= */
/* V0.2 END */
/* ============================= */