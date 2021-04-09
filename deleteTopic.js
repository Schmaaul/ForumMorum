const fs = require("fs");
const topicToDelete = parseInt(process.argv[2])

if (topicToDelete.toString().length != 5) {
    console.log("Invalid topic id")
    return}

if (!fs.existsSync(`topics/${topicToDelete}.json`)) { 
    console.log("Topic not found")
    return
}

const topicList = JSON.parse(fs.readFileSync("topics/topicList.json"))
const messagemap = JSON.parse(fs.readFileSync("topics/messagemap.json"))
const topicFile = JSON.parse(fs.readFileSync(`topics/${topicToDelete}.json`))

// Delete messages from map
for (const [key, value] of Object.entries(messagemap)) {
    if (value == topicToDelete) {
        delete messagemap[key]
        
    }
}

let newTopicsWumme = []
// Delete topic from topic list
for (let topicI = 0; topicI < topicList.topics.length; topicI++) {
    const topic = topicList.topics[topicI];
    if (topic.id != topicToDelete) {
        newTopicsWumme.push(topic)
        console.log(topic.name)
    }
}
topicList.topics = newTopicsWumme
//console.log(JSON.stringify(topicList, null, 2))

// Delete topic .json
fs.unlinkSync(`topics/${topicToDelete}.json`)

// save topicList and messagemap
fs.writeFileSync("topics/messagemap.json", JSON.stringify(messagemap, null, 2))
fs.writeFileSync("topics/topicList.json", JSON.stringify(topicList, null, 2))

console.log("Topic Deleted?!")