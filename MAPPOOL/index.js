window.addEventListener("contextmenu", (e) => e.preventDefault());

// START
let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");
let axios = window.axios;
let user = {};

// API /////////////////////////////////////////////////////////////////
const file = [];
let api;
(async () => {
    try {
        const jsonData = await $.getJSON("../_data/api.json");
        jsonData.map((num) => {
            file.push(num);
        });
        api = file[0].api;
    } catch (error) {
        console.error("Could not read JSON file", error);
    }
})();

// NOW PLAYING
let mapContainer = document.getElementById("mapContainer");
let mapArtist = document.getElementById("mapName");
let mapInfo = document.getElementById("mapInfo");
let mapper = document.getElementById("mapper");
let stars = document.getElementById("stars");
let nowPlayingContainer = document.getElementById("nowPlayingContainer");
let stats = document.getElementById("stats");

// Chats
let chatContainer = document.getElementById("chatContainer");

// Avatar
let avaLeft = document.getElementById("avatarLeft");
let avaRight = document.getElementById("avatarRight");
let avaSet = 0;

const beatmaps = new Set(); // Store beatmapID;

socket.onopen = () => {
    console.log("Successfully Connected");
};

socket.onclose = (event) => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};

socket.onerror = (error) => {
    console.log("Socket Error: ", error);
};

let tempUID;

let tempMapID, tempImg, tempMapArtist, tempMapTitle, tempMapDiff, tempMapper;

let tempSR, tempCS, tempAR, tempOD, tempHP;

let scoreLeftTemp, scoreRightTemp;

let gameState;

let chatLen = 0;
let tempClass = "unknown";

let hasSetup = false;

let scoreLeft = [];
let scoreRight = [];

const mods = {
    NM: 0,
    HD: 1,
    HR: 2,
    DT: 3,
    FM: 4,
    BAM: 5,
};

class Beatmap {
    constructor(mods, beatmapID, layerName) {
        this.mods = mods;
        this.beatmapID = beatmapID;
        this.layerName = layerName;
    }
    generate() {
        let mappoolContainer = document.getElementById(`${this.mods}`);

        this.clicker = document.createElement("div");
        this.clicker.id = `${this.layerName}Clicker`;

        mappoolContainer.appendChild(this.clicker);
        let clickerObj = document.getElementById(this.clicker.id);

        this.bg = document.createElement("div");
        this.map = document.createElement("div");
        this.overlay = document.createElement("div");
        this.metadata = document.createElement("div");
        this.difficulty = document.createElement("div");
        this.stats = document.createElement("div");
        this.modIcon = document.createElement("div");
        this.modText = document.createElement("div");
        this.pickedStatus = document.createElement("div");
        // this.pickIcon = document.createElement("div");

        this.bg.id = this.layerName;
        this.map.id = `${this.layerName}BG`;
        this.overlay.id = `${this.layerName}Overlay`;
        this.metadata.id = `${this.layerName}META`;
        this.difficulty.id = `${this.layerName}DIFF`;
        this.stats.id = `${this.layerName}Stats`;
        this.modIcon.id = `${this.layerName}ModIcon`;
        this.modText.id = `${this.layerName}ModText`;
        this.pickedStatus.id = `${this.layerName}STATUS`;
        // this.pickIcon.id = `${this.layerName}PICKED`;

        this.metadata.setAttribute("class", "mapInfo");
        this.difficulty.setAttribute("class", "mapInfoStat");
        this.map.setAttribute("class", "map");
        this.pickedStatus.setAttribute("class", "pickingStatus");
        this.overlay.setAttribute("class", "overlay");
        this.modIcon.setAttribute("class", "modIcon");
        this.modIcon.style.backgroundImage = `url("../_shared_assets/design/mods/${this.mods}.png")`;
        this.modText.setAttribute("class", "modText");
        this.modText.innerHTML = this.mods;
        // this.pickIcon.setAttribute("class", "pickIcon");
        // this.pickIcon.style.backgroundImage = `url("../_shared_assets/design/mods/pick_indicator.png")`;
        this.clicker.setAttribute("class", "clicker");
        clickerObj.appendChild(this.map);
        document.getElementById(this.map.id).appendChild(this.overlay);
        document.getElementById(this.map.id).appendChild(this.metadata);
        document.getElementById(this.map.id).appendChild(this.difficulty);
        clickerObj.appendChild(this.pickedStatus);
        clickerObj.appendChild(this.bg);
        clickerObj.appendChild(this.stats);
        clickerObj.appendChild(this.modIcon);
        // clickerObj.appendChild(this.pickIcon);

        clickerObj.appendChild(this.modText);
        this.clicker.style.transform = "translateY(0)";
    }
    grayedOut() {
        this.overlay.style.opacity = '1';
    }
}

let bestOfTemp;
let scoreVisibleTemp;
let starsVisibleTemp;

let team1 = "Red",
    team2 = "Blue";

socket.onmessage = async(event) => {
    let data = JSON.parse(event.data);

    if (!hasSetup) setupBeatmaps();

    if (chatLen != data.tourney.manager.chat.length) {
        updateChat(data);
    }
};

function updateChat(data) {
    if (chatLen == 0 || (chatLen > 0 && chatLen > data.tourney.manager.chat.length)) {
        // Starts from bottom
        chats.innerHTML = "";
        chatLen = 0;
    }

    // Add the chats
    for (var i = chatLen; i < data.tourney.manager.chat.length; i++) {
        tempClass = data.tourney.manager.chat[i].team;

        // Chat variables
        let chatParent = document.createElement('div');
        chatParent.setAttribute('class', 'chat');

        let chatTime = document.createElement('div');
        chatTime.setAttribute('class', 'chatTime');

        let chatName = document.createElement('div');
        chatName.setAttribute('class', 'chatName');

        let chatText = document.createElement('div');
        chatText.setAttribute('class', 'chatText');

        chatTime.innerText = data.tourney.manager.chat[i].time;
        chatName.innerText = data.tourney.manager.chat[i].name + ":\xa0";
        chatText.innerText = data.tourney.manager.chat[i].messageBody;

        chatName.classList.add(tempClass);

        chatParent.append(chatTime);
        chatParent.append(chatName);
        chatParent.append(chatText);
        chats.append(chatParent);
    }

    // Update the Length of chat
    chatLen = data.tourney.manager.chat.length;

    // Update the scroll so it's sticks at the bottom by default
    chats.scrollTop = chats.scrollHeight;
}

async function setupBeatmaps() {
    hasSetup = true;

    const modsCount = {
        NM: 0,
        HD: 0,
        HR: 0,
        DT: 0,
        FM: 0,
        BAM: 0,
    };

    const bms = [];
    try {
        const jsonData = await $.getJSON("../_data/beatmaps.json");
        jsonData.map((beatmap) => {
            bms.push(beatmap);
        });
    } catch (error) {
        console.error("Could not read JSON file", error);
    }

    (function countMods() {
        bms.map((beatmap) => {
            modsCount[beatmap.pick.substring(0,2)]++;
        });
    })();

    let row = -1;
    let preMod = 0;
    let colIndex = 0;
    bms.map(async(beatmap, index) => {
        if (beatmap.mods !== preMod || colIndex % 3 === 0) {
            preMod = beatmap.pick.substring(0,2);
            colIndex = 0;
            row++;
        }
        const bm = new Beatmap(beatmap.pick.substring(0,2), beatmap.beatmapId, `map${index}`);
        bm.generate();
        bm.clicker.addEventListener("mousedown", function() {
            bm.clicker.addEventListener("click", function(event) {
                if (event.shiftKey) {
                    // bm.pickedStatus.style.color = "#de3950";
                    bm.pickedStatus.style.backgroundColor = "rgba(0, 0, 0, 0)";
                    bm.pickedStatus.style.top = "0px";
                    // bm.pickedStatus.style.left = "0px";
                    bm.pickedStatus.style.right = "20px";
                    bm.pickedStatus.style.width = "500px";
                    bm.pickedStatus.style.height = "70px";
                    bm.pickedStatus.style.lineHeight = "70px";
                    bm.pickedStatus.style.fontSize = "25px";
                    bm.overlay.style.zIndex = 3;
                    bm.overlay.style.opacity = "0.8";
                    bm.metadata.style.opacity = "0.3";
                    bm.difficulty.style.opacity = "0.3";
                    bm.stats.style.opacity = "0";
                    bm.bg.style.opacity = "0";
                    // bm.pickedStatus.style.textShadow = "0 0 10px black";
                    setTimeout(function() {
                        bm.pickedStatus.style.opacity = "1";
                        bm.pickedStatus.innerHTML = `Banned by P1`;
                    }, 150);
                } else if (event.ctrlKey) {
                    bm.pickedStatus.style.right = "50px";
                    bm.overlay.style.opacity = "0.6";
                    bm.metadata.style.opacity = "1";
                    bm.difficulty.style.opacity = "1";
                    bm.stats.style.opacity = "1";
                    bm.bg.style.opacity = "1";
                    bm.overlay.style.zIndex = 0;
                    // bm.pickedStatus.style.left = "100px";
                    bm.pickedStatus.style.opacity = "0";
                    bm.pickedStatus.style.backgroundColor = "rgba(0,0,0,0)";
                    setTimeout(function() {
                        bm.pickedStatus.style.opacity = "1";
                        bm.pickedStatus.innerHTML = "";
                    }, 150);
                } else {
                    bm.pickedStatus.style.right = "50px";
                    // bm.pickedStatus.style.color = "#fff";
                    bm.pickedStatus.style.backgroundColor = "white";
                    bm.pickedStatus.style.top = "45px";
                    // bm.pickedStatus.style.left = "0px";
                    bm.pickedStatus.style.width = "100px";
                    bm.pickedStatus.style.height = "20px";
                    bm.pickedStatus.style.lineHeight = "20px";
                    bm.pickedStatus.style.fontSize = "13px";
                    bm.overlay.style.zIndex = 0;
                    bm.overlay.style.opacity = "0.6";
                    bm.metadata.style.opacity = "1";
                    bm.difficulty.style.opacity = "1";
                    bm.stats.style.opacity = "1";
                    bm.bg.style.opacity = "1";
                    // bm.pickedStatus.style.textShadow = "0 0 0 rgba(0,0,0,0)";
                    setTimeout(function() {
                        bm.pickedStatus.style.opacity = "1";
                        bm.pickedStatus.innerHTML = "P1 PICK";
                    }, 150);
                }
            });
            bm.clicker.addEventListener("contextmenu", function(event) {
                if (event.shiftKey) {
                    // bm.pickedStatus.style.color = "#2982e3";
                    bm.pickedStatus.style.backgroundColor = "rgba(0, 0, 0, 0)";
                    bm.pickedStatus.style.top = "0px";
                    // bm.pickedStatus.style.left = "0px";
                    bm.pickedStatus.style.right = "20px";
                    bm.pickedStatus.style.width = "500px";
                    bm.pickedStatus.style.height = "70px";
                    bm.pickedStatus.style.lineHeight = "70px";
                    bm.pickedStatus.style.fontSize = "25px";
                    bm.overlay.style.zIndex = 3;
                    bm.overlay.style.opacity = "0.8";
                    bm.metadata.style.opacity = "0.3";
                    bm.difficulty.style.opacity = "0.3";
                    bm.stats.style.opacity = "0";
                    bm.bg.style.opacity = "0";
                    // bm.pickedStatus.style.textShadow = "0 0 10px black";
                    setTimeout(function() {
                        bm.pickedStatus.style.opacity = "1";
                        bm.pickedStatus.innerHTML = `Banned by P2`;
                    }, 150);
                } else if (event.ctrlKey) {
                    bm.pickedStatus.style.right = "50px";
                    bm.overlay.style.opacity = "0.6";
                    bm.metadata.style.opacity = "1";
                    bm.difficulty.style.opacity = "1";
                    bm.stats.style.opacity = "1";
                    bm.bg.style.opacity = "1";
                    bm.overlay.style.zIndex = 0;
                    // bm.pickedStatus.style.left = "100px";
                    bm.pickedStatus.style.opacity = "0";
                    bm.pickedStatus.style.backgroundColor = "rgba(0,0,0,0)";
                    setTimeout(function() {
                        bm.pickedStatus.style.opacity = "1";
                        bm.pickedStatus.innerHTML = "";
                    }, 150);
                } else {
                    bm.pickedStatus.style.right = "50px";
                    // bm.pickedStatus.style.color = "#fff";
                    bm.pickedStatus.style.backgroundColor = "white";
                    bm.pickedStatus.style.top = "45px";
                    // bm.pickedStatus.style.left = "0px";
                    bm.pickedStatus.style.width = "100px";
                    bm.pickedStatus.style.height = "20px";
                    bm.pickedStatus.style.lineHeight = "20px";
                    bm.pickedStatus.style.fontSize = "13px";
                    bm.overlay.style.zIndex = 0;
                    bm.overlay.style.opacity = "0.6";
                    bm.metadata.style.opacity = "1";
                    bm.difficulty.style.opacity = "1";
                    bm.stats.style.opacity = "1";
                    bm.bg.style.opacity = "1";
                    // bm.pickedStatus.style.textShadow = "0 0 0 rgba(0,0,0,0)";
                    setTimeout(function() {
                        bm.pickedStatus.style.opacity = "1";
                        bm.pickedStatus.innerHTML = "P2 PICK";
                    }, 150);
                }
            });
        });
        const mapData = await getDataSet(beatmap.beatmapId);
        bm.map.style.backgroundImage = `url('https://assets.ppy.sh/beatmaps/${mapData.beatmapset_id}/covers/cover.jpg')`;
        bm.metadata.innerHTML = mapData.artist + ' - ' + mapData.title;
        bm.difficulty.innerHTML = `[${mapData.version}]` + '&emsp;&emsp;Mapper: ' + mapData.creator;
        beatmaps.add(bm);
    });
}

async function getDataSet(beatmapID) {
    try {
        const data = (
            await axios.get("/get_beatmaps", {
                baseURL: "https://osu.ppy.sh/api",
                params: {
                    k: api,
                    b: beatmapID,
                },
            })
        )["data"];
        return data.length !== 0 ? data[0] : null;
    } catch (error) {
        console.error(error);
    }
};