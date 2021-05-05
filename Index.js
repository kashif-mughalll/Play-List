var InputBox = document.querySelector('.Cont1');
var ListBtn = document.getElementById('CreatePlayListBtn');
var AddCategoryBtn = document.querySelector('#SubmitBtn');
var AddVideoToCategoryBtn = document.querySelector('#SubmitBtn2');
var CategoryContainer = document.querySelector('.playListContainer');
var Url_Bar = document.getElementById('URL-Bar');
var Name_Feild = document.getElementById('Name-Feild');
var Layer2 = document.querySelector('.Cont2');
// var VideoPlayer = document.getElementById('VideoPlayer');
var CancelBtn = document.getElementById('CancelBtn');
var CancelBtn2 = document.getElementById('CancelBtn2');
var SearchBar = document.querySelector('.SearchBar');
var FacebookPlayer = document.getElementById('FacebookVideoPlayer');
var CategoryID;

var Categories = [];



var LastPlayedVideo = localStorage.getItem('LastPlayed');
if(LastPlayedVideo != null) {
    LastPlayedVideo = LastPlayedVideo.substring(1,LastPlayedVideo.length-1);
    PlayVideo(LastPlayedVideo);
}else{
    PlayVideo("https://youtu.be/9YffrCViTVk");
}
LoadFromDB();



// ################ Event Listener #######################


SearchBar.addEventListener('keyup',(e)=>{
    let Text = e.target.value;

    if(Text == '') RefreshPlayList();
    else SearchInCategories(Text);
})


function SearchInCategories(Text){
    let Filter = [];
    
    let Search = {
        Collapse : false,
        ID : 'S123QW21112Q444',
        Title : 'Search Result .....',
        Videos : []
    }

    Categories.forEach(Category => {        
        Category.Videos.forEach( Video => {            
            if(Video.Title.toLowerCase().includes(Text.toLowerCase())) Search.Videos.push(Video)
        });
    });

    Filter.push(Search);

    RefreshPlayList(true,Filter);
}


Layer2.addEventListener('click',(e)=>{
    if(e.target.id == 'Hide2'){
        Layer2.style.display = 'none';
    }
})

CancelBtn2.addEventListener('click',()=>{
    Layer2.style.display = 'none';
});

CancelBtn.addEventListener('click',()=>{
    InputBox.style.display = 'none';
});

InputBox.addEventListener('click',(e)=>{
    if(e.target.id == 'Hide1'){
        InputBox.style.display = 'none';
    }
});

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
    document.getElementById("InputBoxText").value = '';
})

AddVideoToCategoryBtn.addEventListener('click',()=>{
    let Video = {
        Type : GetVideoType(Url_Bar.value),
        ID : GenerateRandomID(),
        Title : Name_Feild.value,
        URL : Url_Bar.value
    }
    AddVideoToCategory(Video,CategoryID);
    CategoryID = '';
    Layer2.style.display = 'none';
    Name_Feild.value = '';
    Url_Bar.value = '';
});


CategoryContainer.addEventListener('click',(e)=>{
    var element = e.target;

    if(element.classList.contains("Add-To-Category")){
        if(element.parentElement.parentElement.parentElement.id != 'S123QW21112Q444'){
            Layer2.style.display = 'flex';
            CategoryID = element.parentElement.parentElement.parentElement.id;
        }        
    }
    else if(element.classList.contains("Delete-Video")){
        DeleteVideo(element.parentElement);
    }
    else if(element.classList.contains("Delete-Category")){
        if(element.parentElement.parentElement.parentElement.id != 'S123QW21112Q444') 
            DeleteCategory(element.parentElement.parentElement.parentElement);
        else { 
            RefreshPlayList();
            SearchBar.value = ''
        }
    }
    else if(element.classList.contains("VideoTitleStyle")){
        PlayVideo(element.parentElement.getAttribute('video-url'))        
    }
    else if(element.classList.contains("Caret-right")){
        if( element.parentElement.parentElement.parentElement.id != 'S123QW21112Q444' )
            CollapseOrExpand(element.parentElement.parentElement.parentElement.id);
    }
})





// $$$$$$$$$$$$$$$$$$$$$$$$$$   funtions    $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$



function AddCategory(Obj,bool = true){

    let CategoryNode

    if(Obj.ID == 'S123QW21112Q444')
    {
        CategoryNode = `    
        <div Collapse=${Obj.Collapse} id="${Obj.ID}" class="PlayListCategory">
        <div class="CategoryTitle">
            <div class="flex">  <i class="fas fa-caret-right Caret-right ${!Obj.Collapse ? 'Rotate1' : 'RotateBack'}"></i>  </div>
            <h1 class="CategoryTitleStyle"> ${Obj.Title} </h1>
            <div class="flex3">  </div>
            <div class="flex3"> <i class="fas fa-reply CategoryIcons2 Delete-Category"></i>  </div>
        </div>
        </div>`;
    }
    else
    {
        CategoryNode = `    
        <div Collapse=${Obj.Collapse} id="${Obj.ID}" class="PlayListCategory">
        <div class="CategoryTitle">
            <div class="flex">  <i class="fas fa-caret-right Caret-right ${!Obj.Collapse ? 'Rotate1' : 'RotateBack'}"></i>  </div>
            <h1 class="CategoryTitleStyle"> ${Obj.Title} </h1>
            <div class="flex3"> <i class="fas fa-plus-circle CategoryIcons2 Add-To-Category"></i> </div>
            <div class="flex3"> <i class="fas fa-trash CategoryIcons2 Delete-Category"></i>  </div>
        </div>
        </div>`;
    }

    CategoryContainer.innerHTML += CategoryNode;
    if(bool) Categories.push(Obj);
    UpdateDB();
}


function AddVideoToCategory(Video,CategoryID,bool = true){
    let bool1 = false;
    if(Video.Type == 'youtube') bool1 = true;
    var VideoNode = `
    <div id="${Video.ID}" video-url="${Video.URL}" class="CategoryElements">
        <i class="fab fa-${bool1 ? 'youtube' : 'facebook-square'} CategoryIcons margin1"></i>
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


function DeleteVideo(Node,bool = false){
    let CategoryId = Node.parentElement.id;
    let VideoID = Node.id;
    let DeletedVideoID = youtube_parser(Node.getAttribute('video-url'));
    let PlayingVideoID = youtube_parser(document.getElementById('VideoPlayer').src);
    
    for (let i = 0; i < Categories.length; i++) {
        const Category = Categories[i];
        // if(Category.ID == CategoryId){
            
        // }
        for (let j = 0; j <  Category.Videos.length; j++) {
            const Video = Category.Videos[j];
            if(Video.ID == VideoID) Category.Videos.splice(j,1); 
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
    let Container = document.getElementById('IframeDiv');
    if(youtube_parser(URL) != false){
        let YoutubeFrame = `<iframe id="VideoPlayer" class="VideoPlayer" src="https://www.youtube.com/embed/${youtube_parser(URL)}?enablejsapi=1&autoplay=1&version=3&playerapiid=ytplayer" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        Container.innerHTML = YoutubeFrame;
        localStorage.setItem('LastPlayed',JSON.stringify(URL));
        document.getElementById('VideoPlayer').onload = ()=> { PlayIframeVideo() };
    }
    else{
        let FaceBookFrame = `<iframe class="VideoPlayer" id="FacebookVideoPlayer" src="https://www.facebook.com/plugins/video.php?autoplay=1&mute=0&href=${URL}" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen="true"></iframe>`;
        Container.innerHTML = FaceBookFrame;
        localStorage.setItem('LastPlayed',JSON.stringify(URL));
    }    
}


function youtube_parser(url){
    var regExp = /^https?\:\/\/(?:www\.youtube(?:\-nocookie)?\.com\/|m\.youtube\.com\/|youtube\.com\/)?(?:ytscreeningroom\?vi?=|youtu\.be\/|vi?\/|user\/.+\/u\/\w{1,2}\/|embed\/|watch\?(?:.*\&)?vi?=|\&vi?=|\?(?:.*\&)?vi?=)([^#\&\?\n\/<>"']*)/i;
    var match = url.match(regExp);
    return (match && match[1].length==11)? match[1] : false;
}

function RefreshPlayList(bool = false,Filter){
    let Categories = this.Categories;
    if (bool) Categories = Filter;
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
        Type : 'youtube',
        ID : '12121',
        Title : 'Mustafa pe lakhon salaam',
        URL : "https://youtu.be/HvkqvbdwOlw"
    }    
    var Video2 = {
        Type : 'youtube',
        ID : '112wsed334',
        Title : 'Wahi khuda hai',
        URL : "https://youtu.be/74cVT_tUpck"
    }    
    var Video3 = {
        Type : 'youtube',
        ID : '1123ssw3w4',
        Title : 'Illahi teri chokhat pr',
        URL : "https://youtu.be/0IGumjEflTo"
    }    
    var Video4 = {
        Type : 'youtube',
        ID : GenerateRandomID(),
        Title : 'Mohammad ka roza kareeb aa raha hai',
        URL : "https://youtu.be/roa_88pASak"
    }    
    var Video5 = {
        Type : 'facebook',
        ID : '5546ttr54tr',
        Title : 'CPL kamran akmal batting video',
        URL : "https://fb.watch/5ifiK1XBiH/"
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
    var Category3 = {
        Collapse : false,
        ID : '12kk12112122',
        Title : 'Facebook',
        Videos : []
    }
    
    Category1.Videos.push(Video1);
    Category1.Videos.push(Video2);    
    Category2.Videos.push(Video3);
    Category2.Videos.push(Video4);
    Category3.Videos.push(Video5);
    Categories.push(Category1);
    Categories.push(Category2);
    Categories.push(Category3);
}


function GetVideoType(URL){
    if(youtube_parser(URL) != false){
        return 'youtube';
    }else{
        return 'facebook';
    }
}

