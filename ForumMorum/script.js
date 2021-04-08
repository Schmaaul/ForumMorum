var info;
let topic = 0;
let lastUpdate = 0;
const addTopicDiv = document.getElementById("topicaddbutton")
const topicNameInput = document.getElementById("topicNameInput")
function start(){
    const contentDiv = document.getElementById("contentdiv")
    const topicDiv = document.getElementById("topicdiv")
    
    
    const http = new XMLHttpRequest()
    let url = ""
    if (window.location.href.endsWith("/")){
        url = window.location.href + "info"
    } else {
        url = window.location.href + "/info"
    }
    
    http.open("GET", url);
    http.send();


    http.onreadystatechange=function(){
        if(this.readyState!=4 || this.status!=200) return;

        lastUpdate = Date.now()

        info = http.responseText
        console.log(info)
        info = JSON.parse(info)
        if (info.selected != "nf") {topic = info.selected};
        
        // Loading the Topic div
        topicDiv.innerHTML = ""
        info.topics.forEach(element => {
            let additionalclass = ""
            if (element.id === parseInt(info.selected)) additionalclass = "selectedtopic"
            topicDiv.innerHTML += `<a href="${window.location.origin + "/" + element.id}" style="display:block"><div class="topiclistitem ${additionalclass} id="${element.id}">${element.name}</div></a>`
        });

        //Display things like the 404 page
        if (info.contentType == "raw"){
            displayRawContent(info.content)
        } else if (info.contentType == "json") {
            contentDiv.innerHTML = ""
            var messages =  Object.values(info.content.messages)
            messages.forEach(message => {
                renderMessage(message)
            });
        }
        if (info.addMsgEnabled){
            renderAddMsg()
        } else (removeAddMsg())
        
    }

    function displayRawContent(content){
        contentDiv.innerHTML = content
    }
    

}

function addMsg(){
    var message = {}
    message.content = document.getElementById("msg-feld").value
    message.author = document.getElementById("alias-feld").value
    message.topic = info.selected
    const http = new XMLHttpRequest()
    http.open("POST",window.location.origin + "/addmsg")
    http.send(JSON.stringify(message))
    console.log(message)
    const content = document.getElementById("contentdiv")
    /*const html = createElementFromHTML(`<div class='message'>
      <p><span class="msg-autor">${message.author}</span><span class="msg-date">datum</span></p>
      <hr>
      <p>${message.content}</p>
      
      <p>Likes: 0</p>
    </div>`)*/
    const html = createElementFromHTML(`<div class='message' id=${message.id}>
      <p class="msg-top"><span class="msg-autor">${message.author}</span><span class="msg-date">${d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()+" "+d.getHours()+":"+minutes+":"+seconds}</span></p>
      
      <p class="msg-cont">${message.content}</p>
      
      <div class="likes noselect" id="l${message.id}" onclick="likeMessage('${message.id}')">❤ <span id="l${message.id}">${message.likes}</span></div>
    </div>`)
    content.insertBefore(html, content.children[content.children.length-1])
}

function renderMessage(message) {
    var d = new Date(message.creationDate)
    var minutes = ""+d.getMinutes()
    var seconds = ""+d.getSeconds()
    if (minutes.length == 1){
        minutes = "0"+minutes
    }
    if (seconds.length == 1){
        seconds = "0"+seconds
    }
    const content = document.getElementById("contentdiv")
    const html = createElementFromHTML(`<div class='message' id=${message.id}>
      <p class="msg-top"><span class="msg-autor">${message.author}</span><span class="msg-date">${d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()+" "+d.getHours()+":"+minutes+":"+seconds}</span></p>
      
      <p class="msg-cont">${message.content}</p>
      
      <div class="likes noselect" id="l${message.id}" onclick="likeMessage('${message.id}')">❤ <span id="l${message.id}">${message.likes}</span></div>
    </div>`)
    content.appendChild(html)
}

function renderAddMsg() {
    const contentDiv = document.getElementById("contentdiv")
    const addMsgForm = document.getElementById("add-msg-div")
    if (addMsgForm){
            addMsgForm.remove()
    }
    const html = createElementFromHTML(`<div id="add-msg-div">
    <hr>
    <p>Nachricht Hinzufügen</p>
    <label for="alias-feld"><p>Alias:</p></label>
    <input type="text" name="alias" id="alias-feld" value="Anonym">
    <br>
    <label for="msg-feld"><p>Nachricht:</p></label>
    <textarea name="msg" id="msg-feld" cols="30" rows="10"></textarea>
    <br>
    <button id="add-msg-button" onclick="addMsg()">Hinzufügen</button>
  </div>`)
    contentDiv.appendChild(html)
}
function renderNewAddMsg() {
    const contentDiv = document.getElementById("contentdiv")
    removeAddMsg()
    const html = createElementFromHTML(`<div></div>`)
}
function removeAddMsg() {
    const addMsgForms = document.getElementsById("add-msg-div")
    if (addMsgForms){
            for (let i = 0; i < addMsgForms.length; i++) {
                const form = addMsgForms[i];
                form.remove()
            }
    }
}

function likeMessage(id){
    const likeDiv = document.getElementById(`l${id}`)
    if (likeDiv.classList.contains("liked")) {
        return
    }
    likeDiv.classList.add("liked")
    let likes = parseInt(likeDiv.getElementsByTagName("span")[0].innerHTML) +1
    likeDiv.getElementsByTagName("span")[0].innerHTML = likes
    const http = new XMLHttpRequest()
    console.log("like " + id)
    http.open("GET",`${window.location.origin}/like/${id}`)
    http.send()
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
  
    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild; 
}

function extend(){
    
    addTopicDiv.classList.remove("notExtended")
    addTopicDiv.classList.add("extended")
}

function addTopicButtonHandler(){ 
    addTopicDiv.classList.remove("extended")
    addTopicDiv.classList.add("notExtended")
    if (!isValidTopicName(topicNameInput.value)){
        addTopicDiv.classList.add("red")
        setTimeout(()=>{
            addTopicDiv.classList.remove("red")
        },1000)
        return
    }
    addTopic(topicNameInput.value)
    topicNameInput.value = ""
    addTopicDiv.classList.add("green")
        setTimeout(()=>{
            addTopicDiv.classList.remove("green")
        },1000)
}

function addTopic(name){
    const http = new XMLHttpRequest()
    http.open("POST",window.location.origin + "/addtopic")
    http.send(name)
}

function isValidTopicName(name){
    const notAllowedSymbols = ["<",">",`\\`,"/"]
    if (name.length > 20){return false}
    for (let i = 0; i < name.length; i++) {
        const letter = name[i];
        if (notAllowedSymbols.includes(letter)){return false}
    }
        
    
    if (name.length < 3){return false}
    return true
}

setInterval(function () {
    const http = new XMLHttpRequest()
    http.open("GET",`${window.location.origin}/update/${topic}/${lastUpdate}`)
    http.send()
    http.onreadystatechange=function(){
        if(this.readyState!=4 || this.status!=200) return;
        if (http.responseText == "true") start();
        //console.log(http.responseText)
    }
}, 1000)