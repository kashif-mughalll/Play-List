var InputBox = document.querySelector('.Cont1');
var ListBtn = document.getElementById('CreatePlayListBtn');
var AddCategoryBtn = document.querySelector('#SubmitBtn');
var AddVideoToCategoryBtn = document.querySelector('#SubmitBtn2');
var CategoryContainer = document.querySelector('.playListContainer');
var Url_Bar = document.getElementById('URL-Bar');
var Name_Feild = document.getElementById('Name-Feild');
var Layer2 = document.querySelector('.Cont2');
var VideoPlayer = document.getElementById('VideoPlayer');
var CategoryID;


var Categories = [];




// RefreshPlayList()



LoadFromDB();


// InputBox.style.display = 'none';


// ################ Event Listener #######################


ListBtn.addEventListener('click',()=>{
    InputBox.style.display = 'flex';
})

AddCategoryBtn.addEventListener('click',()=>{
    var Category = {
        Collapse : false,
        ID : GenerateRandomID(),
        Title : document.getElementById("InputBoxText").value,
        Videos : []
    }
    AddCategory(Category);
    InputBox.style.display = 'none';
})

AddVideoToCategoryBtn.addEventListener('click',()=>{
    let Video = {
        ID : GenerateRandomID(),
        Title : Name_Feild.value,
        URL : Url_Bar.value
    }
    AddVideoToCategory(Video,CategoryID);
    CategoryID = '';
    Layer2.style.display = 'none';
});


CategoryContainer.addEventListener('click',(e)=>{
    var element = e.target;

    if(element.classList.contains("Add-To-Category")){
        Layer2.style.display = 'flex';
        CategoryID = element.parentElement.parentElement.parentElement.id;
    }
    else if(element.classList.contains("Delete-Video")){
        DeleteVideo(element.parentElement);
    }
    else if(element.classList.contains("Delete-Category")){
        DeleteCategory(element.parentElement.parentElement.parentElement);
    }
    else if(element.classList.contains("VideoTitleStyle")){
        PlayVideo(element.parentElement.getAttribute('video-url'))        
    }
    else if(element.classList.contains("Caret-right")){
        CollapseOrExpand(element.parentElement.parentElement.parentElement.id);
    }
})



// document.querySelector('.navbar').addEventListener('click',()=>{
//     // RefreshPlayList();
//     // console.log("refreshed")
//     console.log(Categories)
// })





// $$$$$$$$$$$$$$$$$$$$$$$$$$   funtions    $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

function AddCategory(Obj,bool = true){
    var CategoryNode = `    
    <div Collapse=${Obj.Collapse} id="${Obj.ID}" class="PlayListCategory">
        <div class="CategoryTitle">
            <div class="flex">  <i class="fas fa-caret-right Caret-right ${Obj.Collapse ? 'Rotate1' : 'RotateBack'}"></i>  </div>
            <h1 class="CategoryTitleStyle"> ${Obj.Title} </h1>
            <div class="flex3"> <i class="fas fa-plus-circle CategoryIcons2 Add-To-Category"></i> </div>
            <div class="flex3"> <i class="fas fa-trash CategoryIcons2 Delete-Category"></i>  </div>
        </div>
    </div>
    `;

    CategoryContainer.innerHTML += CategoryNode;
    if(bool) Categories.push(Obj);
    UpdateDB();
}


function AddVideoToCategory(Video,CategoryID,bool = true){
    var VideoNode = `
    <div id="${Video.ID}" video-url="${Video.URL}" class="CategoryElements">
        <i class="fab fa-youtube CategoryIcons margin1"></i>
        <p class="VideoTitleStyle"> ${Video.Title} </p>
        <i class="fas fa-times CategoryIcons Delete-Video"></i>
    </div>
    `;
    document.getElementById(CategoryID).innerHTML += VideoNode;

    if(bool){
        Categories.forEach(Category => {
            if(Category.ID == CategoryID) Category.Videos.push(Video);
        });
    }
    UpdateDB()
}

function GenerateRandomID(){
    return new Date().getTime().toString() + new Date().toISOString().
    replaceAll('.',"").replaceAll(':',"");
}


function DeleteVideo(Node){
    let CategoryId = Node.parentElement.id;
    let VideoID = Node.id;
    let DeletedVideoID = youtube_parser(Node.getAttribute('video-url'));
    let PlayingVideoID = youtube_parser(document.getElementById('VideoPlayer').src);
    
    for (let i = 0; i < Categories.length; i++) {
        const Category = Categories[i];
        if(Category.ID == CategoryId){
            for (let j = 0; j <  Category.Videos.length; j++) {
                const Video = Category.Videos[j];
                if(Video.ID == VideoID) Category.Videos.splice(j,1);
            }
        }
    }
    Node.remove();

    if(DeletedVideoID == PlayingVideoID) {
        StopIframeVideo();
        if(Categories[0].Videos[0]) PlayVideo(Categories[0].Videos[0].URL);
        else PlayVideo("https://youtu.be/9YffrCViTVk");        
    }
    UpdateDB();
}

function DeleteCategory(Node){
    for (let i = 0; i < Categories.length; i++) 
        if(Categories[i].ID == Node.id) Categories.splice(i,1);
    Node.remove(); 
    UpdateDB();   
}


function PlayVideo(URL){
    if(youtube_parser(URL) != false){
        VideoPlayer.src = "https://www.youtube.com/embed/" + youtube_parser(URL) + '?enablejsapi=1&version=3&playerapiid=ytplayer';
    }
    document.getElementById('VideoPlayer').onload = ()=> { PlayIframeVideo() };
}


function youtube_parser(url){
    var regExp = /^https?\:\/\/(?:www\.youtube(?:\-nocookie)?\.com\/|m\.youtube\.com\/|youtube\.com\/)?(?:ytscreeningroom\?vi?=|youtu\.be\/|vi?\/|user\/.+\/u\/\w{1,2}\/|embed\/|watch\?(?:.*\&)?vi?=|\&vi?=|\?(?:.*\&)?vi?=)([^#\&\?\n\/<>"']*)/i;
    var match = url.match(regExp);
    return (match && match[1].length==11)? match[1] : false;
}

function RefreshPlayList(){
    removeAllChildNodes(CategoryContainer);
    Categories.forEach(Category => {
        AddCategory(Category,false);        
        if(!Category.Collapse){
            Category.Videos.forEach(Video => {
                AddVideoToCategory(Video,Category.ID,false);
            });
        }        
    });
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function CollapseOrExpand(CategoryID){
    Categories.forEach(Category => {
        if(Category.ID == CategoryID){ 
            Category.Collapse = !Boolean(Category.Collapse);            
        }
    });
    RefreshPlayList();
}

function UpdateDB(){
    localStorage.setItem('List',JSON.stringify(Categories));
}

function LoadFromDB(){
    if( JSON.parse(localStorage.getItem('List')) == null){
        AddDefault();
        UpdateDB();
    }else Categories = JSON.parse(localStorage.getItem('List'));
    RefreshPlayList();
}

function PlayIframeVideo() {
    document.getElementById('VideoPlayer').contentWindow.postMessage('{"event":"command","func":"' + 'playVideo' + '","args":""}', '*');
}

function StopIframeVideo() {
    document.getElementById('VideoPlayer').contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
}

function PauseIframeVideo() {
    document.getElementById('VideoPlayer').contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
}


function AddDefault(){
    var Video1 = {
        ID : '12121',
        Title : 'Mustafa pe lakhon salaam',
        URL : "https://youtu.be/HvkqvbdwOlw"
    }    
    var Video2 = {
        ID : '112wsed334',
        Title : 'Wahi khuda hai',
        URL : "https://youtu.be/74cVT_tUpck"
    }    
    var Video3 = {
        ID : '1123ssw3w4',
        Title : 'Illahi teri chokhat pr',
        URL : "https://youtu.be/0IGumjEflTo"
    }    
    var Video4 = {
        ID : GenerateRandomID(),
        Title : 'Mohammad ka roza kareeb aa raha hai',
        URL : "https://youtu.be/roa_88pASak"
    }    
    var Category1 = {
        Collapse : false,
        ID : '12de3332',
        Title : 'Atif Aslam',
        Videos : []
    }
    var Category2 = {
        Collapse : false,
        ID : '12kk12',
        Title : 'Junaid Jamshed',
        Videos : []
    }
    Category1.Videos.push(Video1);
    Category1.Videos.push(Video2);    
    Category2.Videos.push(Video3);
    Category2.Videos.push(Video4);
    Categories.push(Category1);
    Categories.push(Category2);
}

