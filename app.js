/* =======================================================
   Bucket App v0.2
   app.js - Part 1
======================================================= */

const STORAGE_KEY = "bucket_v02";
const PHOTO_DB_NAME = "bucket_photos_v1";
const PHOTO_STORE = "photos";
const PHOTO_MAX_SIZE = 1200;
const PHOTO_QUALITY = 0.75;

let buckets = [];
let editingId = null;
let currentCategory = "전체";
let sortMode = "latest";
let completingBucketId = null;
let pendingPhotoData = null;

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

const celebrateModal =
document.getElementById("celebrateModal");

const celebrateTitle =
document.getElementById("celebrateTitle");

const photoInput =
document.getElementById("photoInput");

const photoPreview =
document.getElementById("photoPreview");

const photoPlaceholder =
document.getElementById("photoPlaceholder");

const removePhotoButton =
document.getElementById("removePhotoButton");

const celebrateSaveButton =
document.getElementById("celebrateSaveButton");

const celebrateSkipButton =
document.getElementById("celebrateSkipButton");

const photoViewModal =
document.getElementById("photoViewModal");

const photoViewImage =
document.getElementById("photoViewImage");

const photoViewTitle =
document.getElementById("photoViewTitle");

const closePhotoView =
document.getElementById("closePhotoView");

/* ============================= */

function openPhotoDB(){

    return new Promise((resolve, reject)=>{

        const request=
        indexedDB.open(PHOTO_DB_NAME, 1);

        request.onupgradeneeded=()=>{

            const db=request.result;

            if(!db.objectStoreNames.contains(PHOTO_STORE)){

                db.createObjectStore(PHOTO_STORE);

            }

        };

        request.onsuccess=()=>resolve(request.result);

        request.onerror=()=>reject(request.error);

    });

}

async function savePhoto(bucketId, dataUrl){

    const db=await openPhotoDB();

    return new Promise((resolve, reject)=>{

        const tx=db.transaction(PHOTO_STORE, "readwrite");

        tx.objectStore(PHOTO_STORE).put(dataUrl, bucketId);

        tx.oncomplete=()=>{

            db.close();

            resolve();

        };

        tx.onerror=()=>reject(tx.error);

    });

}

async function getPhoto(bucketId){

    const db=await openPhotoDB();

    return new Promise((resolve, reject)=>{

        const tx=db.transaction(PHOTO_STORE, "readonly");

        const request=
        tx.objectStore(PHOTO_STORE).get(bucketId);

        request.onsuccess=()=>{

            db.close();

            resolve(request.result || null);

        };

        request.onerror=()=>reject(request.error);

    });

}

async function deletePhoto(bucketId){

    const db=await openPhotoDB();

    return new Promise((resolve, reject)=>{

        const tx=db.transaction(PHOTO_STORE, "readwrite");

        tx.objectStore(PHOTO_STORE).delete(bucketId);

        tx.oncomplete=()=>{

            db.close();

            resolve();

        };

        tx.onerror=()=>reject(tx.error);

    });

}

function compressImage(file){

    return new Promise((resolve, reject)=>{

        const reader=new FileReader();

        reader.onload=()=>{

            const img=new Image();

            img.onload=()=>{

                const scale=
                Math.min(
                    1,
                    PHOTO_MAX_SIZE /
                    Math.max(img.width, img.height)
                );

                const canvas=
                document.createElement("canvas");

                canvas.width=
                Math.round(img.width * scale);

                canvas.height=
                Math.round(img.height * scale);

                const ctx=
                canvas.getContext("2d");

                ctx.drawImage(
                    img,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                resolve(
                    canvas.toDataURL(
                        "image/jpeg",
                        PHOTO_QUALITY
                    )
                );

            };

            img.onerror=reject;

            img.src=reader.result;

        };

        reader.onerror=reject;

        reader.readAsDataURL(file);

    });

}

function resetCelebrateForm(){

    pendingPhotoData=null;

    photoInput.value="";

    photoPreview.src="";

    photoPreview.classList.add("hidden");

    photoPlaceholder.classList.remove("hidden");

    removePhotoButton.classList.add("hidden");

}

function openCelebrateModal(item){

    completingBucketId=item.id;

    celebrateTitle.textContent=
    `"${item.title}" 달성!`;

    resetCelebrateForm();

    celebrateModal.classList.add("show");

}

function closeCelebrateModal(){

    celebrateModal.classList.remove("show");

    completingBucketId=null;

    resetCelebrateForm();

}

function openPhotoView(title, dataUrl){

    photoViewTitle.textContent=title;

    photoViewImage.src=dataUrl;

    photoViewModal.classList.add("show");

}

function closePhotoViewModal(){

    photoViewModal.classList.remove("show");

    photoViewImage.src="";

}

async function finishCompletion(withPhoto){

    const item=
    buckets.find(
        b=>b.id===completingBucketId
    );

    if(!item) return;

    item.completed=true;

    if(withPhoto && pendingPhotoData){

        await savePhoto(
            item.id,
            pendingPhotoData
        );

        item.hasPhoto=true;

    }

    saveStorage();

    closeCelebrateModal();

    render();

}

async function renderBucketPhoto(item, container){

    if(!item.completed || !item.hasPhoto) return;

    const dataUrl=await getPhoto(item.id);

    if(!dataUrl){

        item.hasPhoto=false;

        saveStorage();

        return;

    }

    const photoWrap=
    document.createElement("div");

    photoWrap.className="bucketPhoto";

    photoWrap.innerHTML=`

        <img src="${dataUrl}" alt="기념 사진">

        <span class="bucketPhotoLabel">

            📷 기념 사진

        </span>

    `;

    photoWrap.onclick=()=>{

        openPhotoView(item.title, dataUrl);

    };

    container.insertBefore(
        photoWrap,
        container.querySelector(".bucketButtons")
    );

}

photoInput.onchange=async e=>{

    const file=e.target.files[0];

    if(!file) return;

    if(!file.type.startsWith("image/")){

        alert("이미지 파일만 업로드할 수 있습니다.");

        return;

    }

    try{

        pendingPhotoData=
        await compressImage(file);

        photoPreview.src=pendingPhotoData;

        photoPreview.classList.remove("hidden");

        photoPlaceholder.classList.add("hidden");

        removePhotoButton.classList.remove("hidden");

    }catch{

        alert("사진을 불러오지 못했습니다.");

    }

};

removePhotoButton.onclick=()=>{

    resetCelebrateForm();

};

celebrateSaveButton.onclick=()=>{

    finishCompletion(true);

};

celebrateSkipButton.onclick=()=>{

    finishCompletion(false);

};

celebrateModal.onclick=e=>{

    if(e.target===celebrateModal){

        closeCelebrateModal();

    }

};

photoViewModal.onclick=e=>{

    if(
        e.target===photoViewModal ||
        e.target===closePhotoView
    ){

        closePhotoViewModal();

    }

};

closePhotoView.onclick=closePhotoViewModal;

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

        bucket.hasPhoto=
        buckets[index].hasPhoto;

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

        const photoButton=
        item.completed && !item.hasPhoto
        ? `<button class="photoButton">📷 사진</button>`
        : "";

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

${photoButton}

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

        renderBucketPhoto(item, card);

        /* 완료 */

        card
        .querySelector(".completeButton")
        .onclick=async()=>{

            if(!item.completed){

                openCelebrateModal(item);

                return;

            }

            item.completed=false;

            saveStorage();

            render();

        };

        const photoBtn=
        card.querySelector(".photoButton");

        if(photoBtn){

            photoBtn.onclick=()=>{

                openCelebrateModal(item);

            };

        }

        /* 삭제 */

        card
        .querySelector(".deleteButton")
        .onclick=async()=>{

            if(confirm("삭제하시겠습니까?")){

                if(item.hasPhoto){

                    await deletePhoto(item.id);

                }

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

deleteAllButton.onclick=async()=>{

    if(

    confirm(

    "모든 버킷을 삭제하시겠습니까?"

    )

    ){

        for(const bucket of buckets){

            if(bucket.hasPhoto){

                await deletePhoto(bucket.id);

            }

        }

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

            closeCelebrateModal();

            closePhotoViewModal();

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