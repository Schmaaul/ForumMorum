
const http = require("http");
const url = require("url")
const fs = require("fs")
const pathModule = require("path")
const HTMLparse = require("node-html-parser").parse;
const { stringify } = require("querystring");
const { time } = require("console");
const filePath = "\\webdav.gym-altona.de@SSL\DavWWWRoot\Groups\Informatik 1112 Schr 2021\DavidFelixIliasPaulWebsite"
const crypto = require("crypto");
const { valid } = require("node-html-parser");

const server = http.createServer(function(req, res){


    var path = url.parse(req.url).path
    if (req.method === "POST") {
        console.log(`got Post req: ${path}`)
        if (path == "/addmsg")
        {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString(); // convert Buffer to string
            });
            req.on('end', () => {
                addMsg(JSON.parse(body))
                res.end('ok');
            });
            return;
        }
        if (path == "/addtopic")
        {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString(); // convert Buffer to string
            });
            req.on('end', () => {
                addTopic(body)
                res.end('ok');
            });
            return;
        }
        return
    }
    
    
    if (path.endsWith("/info")) {
        path = path.split("/")
        path.pop()
        path = path.join("/")
        
        var responseJSON = {};
        
        responseJSON.topics = JSON.parse(fs.readFileSync("topics/topicList.json", "utf8",(err) => {if (err) throw err})).topics

        if (path == "/index.html" || path == ""){
            responseJSON.selected = "index" // index = Homepage
            responseJSON.contentType = "raw"
            responseJSON.addMsgEnabled = false
        }
        else if (isTopic(path.split("/")[1], responseJSON.topics)){
            responseJSON.selected = path.split("/")[1]
            responseJSON.contentType = "json"
            responseJSON.addMsgEnabled = true
            responseJSON.content = JSON.parse(fs.readFileSync(`topics/${responseJSON.selected}.json`))
        } else {
            //gets displayed if topic dosnt exist
            responseJSON.selected = "nf" // nf = not found
            responseJSON.contentType = "raw"
            responseJSON.addMsgEnabled = false
            responseJSON.content = `<p id="nf">404</p><p id="nftext">This url dosn't exist!</p>`
        }

        res.writeHead(200)
        res.end(JSON.stringify(responseJSON))
        return;
    }
    if (path.includes("/update/")){
        const infos = path.split("/")
        const topic = infos[2]
        const time = infos[3]
        res.end(String(isTopicFileNewer(topic,time)))
        return;
    }
    if (path == "/favicon.ico"){
        res.writeHead(200, {'Content-Type': 'image/x-icon'} );
        res.end();
        return;
    }
    if (path == "/ExternalCSSH.css"){
        res.writeHead(200)
        fs.readFile("ExternalCSSH.css", "utf8", (err, file) => {
            if (err) {
                console.error(err)
                res.writeHead(500)
                return;
            }
            data = file
            res.end(data)
        })
        return;
    }
    if (path == "/script.js"){
        res.writeHead(200)
        fs.readFile("script.js", "utf8", (err, file) => {
            if (err) {
                console.error(err)
                res.writeHead(500)
                return;
            }
            data = file
            res.end(data)
        })
        return;
    }
    if (path.startsWith("/like/")){
        var id = path.split("/")[2]
        likeMessage(id)
        res.end("done")
        return;
    }
    // Temporäre Behfehle
    if (path.includes("/addtopic/")){
        return
        var name = path.split("/")
        name = name[name.length - 1]
        addTopic(name)
        res.end('<html><meta http-equiv = "refresh" content = "0; url = /" /></html>')
        return;
    }
    if (path == "/deletetopics") {
        deleteTopics()
        res.end('<html><meta http-equiv = "refresh" content = "0; url = /" /></html>')
        return;
    }
    if (path.startsWith("/deletemsg/")){
        var id = path.split("/")
        id = id[id.length-1]
        removeMsg(id)
        res.end('<html><meta http-equiv = "refresh" content = "0; url = /" /></html>')
        return;
    }
    res.writeHead(200)
        fs.readFile("main.html", "utf8", (err, file) => {
            if (err) {
                console.error(err)
                res.writeHead(500)
                return;
            }
            data = file
            res.end(data)
        }
        )
    console.log(path)
    

    

    
})



server.listen(80, function(){
    console.log("Listining to port 80!")
})

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


function addTopic(name) {
    
    if (!isValidTopicName(name)) {return false}
    var topicList
    fs.readFile("topics/topicList.json", "utf8", (err, file) => {
        if (err) {
            console.error(err)
            return false;
        }
        topicList = file
    
        topicList = JSON.parse(topicList)
        const topicid = topicList.idindex;
        topicList.idindex++;
        topicList.topics.push({"name":name,"id":topicid,"creationDate":Date.now()})
        
        fs.writeFile("topics/topicList.json", JSON.stringify(topicList, null, 2), (err) => {
            if (err) throw err;
            fs.writeFileSync(`topics/${topicid}.json`, JSON.stringify(createEmptyTopic(name, topicid), null, 2))
            console.log("Added Topic!")
        })
    })
}

function isTopic(id){
    const list = JSON.parse(fs.readFileSync("topics/topicList.json"))
    var is = false
    list.topics.forEach(element => {
        if (element.id.toString() === id.toString()) {
            is = true;
            
        }
    })
    return is;
}

function createEmptyTopic(name, id){
    var topic = {};
    topic.name = name;
    topic.id = id;
    topic.creationDate = Date.now()
    topic.messages = {};
    return topic;
}

function deleteTopics() {
    let topicList = JSON.parse(fs.readFileSync("topics/topicList.json"))
    topicList.topics.forEach(topic => {
        if (fs.existsSync(`topics/${topic.id}.json`)) {
            fs.unlinkSync(`topics/${topic.id}.json`)
            console.log(`Removed "topics/${topic.id}.json"`)
        }

    });
    topicList.topics = []
    topicList.idindex = 10000
    fs.writeFileSync("topics/topicList.json", JSON.stringify(topicList, null, 2))
    fs.writeFileSync("topics/messageMap.json", "{}")
}

function addMsg(message){
    // Check if message is valid
    if (!(parseInt(message.topic)>=10000)) return;
    if (!isTopic(message.topic)) return;

    // Create message info
    message.id = crypto.randomBytes(7).toString("hex")
    message.creationDate = Date.now()
    message.likes = 0

    // Store message to file //
    // to messagemap.json
    var messageMap = fs.readFileSync("topics/messagemap.json")
    messageMap = JSON.parse(messageMap)
    messageMap[message.id] = message.topic
    messageMap = JSON.stringify(messageMap, null, 2)
    fs.writeFileSync("topics/messagemap.json", messageMap)
    
    //to topic file
    var topicFile = fs.readFileSync(`topics/${message.topic}.json`, "utf8")
    topicFile = JSON.parse(topicFile)
    topicFile.messages[message.id] = message
    topicFile.update = Date.now()
    topicFile = JSON.stringify(topicFile, null, 2)
    fs.writeFileSync(`topics/${message.topic}.json`, topicFile)
    
}

function removeMsg(id){
    var messageMap = fs.readFileSync("topics/messagemap.json")
    messageMap = JSON.parse(messageMap)
    if (!messageMap[id]) return;
    const messageTopic = messageMap[id]
    var topicFile = fs.readFileSync(`topics/${messageTopic}.json`, "utf8")
    topicFile = JSON.parse(topicFile)
    delete topicFile.messages[id]
    delete messageMap[id]
    topicFile = JSON.stringify(topicFile, null, 2)
    messageMap = JSON.stringify(messageMap, null, 2)
    fs.writeFileSync("topics/messagemap.json", messageMap)
    fs.writeFileSync(`topics/${messageTopic}.json`, topicFile)
}

function likeMessage(id) {
    var messageMap = fs.readFileSync("topics/messagemap.json")
    messageMap = JSON.parse(messageMap)
    if (!messageMap[id]) return;
    const messageTopic = messageMap[id]
    var topicFile = fs.readFileSync(`topics/${messageTopic}.json`, "utf8")
    topicFile = JSON.parse(topicFile)
    var likes = topicFile.messages[id].likes++
    topicFile = JSON.stringify(topicFile, null, 2)
    fs.writeFileSync(`topics/${messageTopic}.json`, topicFile)
    return likes;
}

function isTopicFileNewer(topicId, time) {
    if (!fs.existsSync(`topics/${topicId}.json`)) return true;
    var topicFile = fs.readFileSync(`topics/${topicId}.json`)
    topicFile = JSON.parse(topicFile)
    //console.log(time-topicFile.update)
    if (topicFile.update > time) return true;
    return false
}