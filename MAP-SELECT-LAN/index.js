// SOCKET
let socket = new ReconnectingWebSocket("ws://" + location.host + "/ws");
socket.onopen = () => {
    console.log("Successfully Connected");
};
socket.onclose = event => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};
socket.onerror = error => {
    console.log("Socket Error: ", error);
};

// BEATMAP DATA /////////////////////////////////////////////////////////////////
let beatmapSet = [];
let beatmaps = [];
let pickLeft;
let pickRight;
(async () => {
    let temp = [];
    try {
        const jsonData = await $.getJSON("../_data/beatmaps.json");
        jsonData.map((beatmap) => {
            beatmapSet.push(beatmap);
        });
        const pickData = await $.getJSON("../_data/picks.json");
        pickData.map((pick) => {
            temp.push(pick);
        });
    } catch (error) {
        console.error("Could not read JSON file", error);
    }
    for (index = 0; index < beatmapSet.length; index++) {
        beatmaps.push(beatmapSet[index]["beatmapId"]);
    }
    pickLeft = temp[0]["playerOne"].split(" ");
    pickRight = temp[1]["playerTwo"].split(" ");
    console.log(pickLeft);
    console.log(pickRight);
})();
console.log(beatmapSet);
console.log(beatmaps);

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

// HTML VARS /////////////////////////////////////////////////////////////////
let revealButton = document.getElementById("revealButton");


// PLACEHOLDER VARS //////////////////////////////////////////////
let hasSetup = false;
const beatmapData = new Set(); // Store beatmaps;
let playerOneTemp = "Player 1";
let playerTwoTemp = "Player 2";
let revealPressed = false;
let one = 0;
let two = 0;
let autoPick = 0;
let currentTurn;
let currentMap;
let previousState;
let bestOfTemp;
let scoreBlueTemp;
let scoreRedTemp;

// MAIN LOOP ////////////////////////////////////////////////////////////////
socket.onmessage = async event => {
    let data = JSON.parse(event.data);

    tempLeft = data.tourney.manager.teamName.left;
    tempRight = data.tourney.manager.teamName.right;

    // Player Names
    if (tempLeft != playerOneTemp) {
        playerOneTemp = tempLeft;
    }
    if (tempRight != playerTwoTemp) {
        playerTwoTemp = tempRight;
    }

    if (!hasSetup) {
        hasSetup = true;
        setTimeout(function() {
            setupBeatmaps();
        }, 750);
    };

    if (previousState != data.tourney.manager.ipcState) {
        checkState(data.tourney.manager.ipcState, data);
        previousState = data.tourney.manager.ipcState;
    }

    if (bestOfTemp !== Math.ceil(data.tourney.manager.bestOF / 2) || scoreBlueTemp !== data.tourney.manager.stars.left || scoreRedTemp !== data.tourney.manager.stars.right) {

		// Courtesy of Victim-Crasher
		bestOfTemp = Math.ceil(data.tourney.manager.bestOF / 2);
        scoreBlueTemp = data.tourney.manager.stars.left;
        scoreRedTemp = data.tourney.manager.stars.right;

    }
}

async function checkState(ipcState, data) {
    // map has ended and its the next player's turn
    if (ipcState == 4 && autoPick == 1) {
        console.log("happened");
        if (data.tourney.manager.gameplay.score.left > data.tourney.manager.gameplay.score.right) {
            console.log("happened2");
            currentMap.clicker.dispatchEvent(altClickEvent);
            // setTimeout(function () {
            //     if ((bestOfTemp-data.tourney.manager.stars.left) == 1 && (bestOfTemp-data.tourney.manager.stars.right) == 1) {
            //         document.getElementById(`leftmap${one}Clicker`).click();
            //     } else {
            //         findNextMapAndClick(currentMap);
            //     }
            // }, 3000)
        } else if (data.tourney.manager.gameplay.score.left < data.tourney.manager.gameplay.score.right) {
            console.log("happened3");
            currentMap.clicker.dispatchEvent(altRightClickEvent);
            // setTimeout(function () {
            //     if ((bestOfTemp-data.tourney.manager.stars.left) == 1 && (bestOfTemp-data.tourney.manager.stars.right) == 1) {
            //         document.getElementById(`leftmap${one}Clicker`).click();
            //     } else {
            //         findNextMapAndClick(currentMap);
            //     }      
            // }, 3000)
        }
    } 
}

const altClickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
    altKey: true,
    button: 0 // Left button (0), middle button (1), right button (2)
});

const altRightClickEvent = new MouseEvent('contextmenu', { // 'contextmenu' for right-click
    bubbles: true,
    cancelable: true,
    view: window,
    altKey: true,
    button: 2 // Right button (2)
});

// CONTROL PANELS //////////
revealButton.addEventListener("click", function(event) {
    if (!revealPressed) {
        revealPressed = true;
        reveal = setInterval(revealMap,500);
    }
})

autoButton.addEventListener("click", function(event) {
    if (autoPick == 0) {
        autoPick = 1;
        autoButton.innerHTML = "AUTO PICK: ON";
        // #007A14
        autoButton.style.backgroundColor = "#00CA22";
    } else {
        autoPick = 0;
        autoButton.innerHTML = "AUTO PICK: OFF";
        autoButton.style.backgroundColor = "#007A14";
    }
})

// FUNCTIONS ////////////////////////////////////////////////////////////////
async function setupBeatmaps() {

    pickLeft.map(async(pick, index) => {
        let beatmapId = beatmapSet.find(beatmap => beatmap["pick"] === pick.substring(0,3))["beatmapId"];
        const bm = new Pick(pick.substring(0,3), beatmapId, `leftmap${index}`, true,pick.length == 4 ? true : false);
        bm.generate();
        
        const mapData = await getDataSet(beatmapId);
        bm.mapData = mapData;
        bm.bg.style.backgroundImage = `url('https://assets.ppy.sh/beatmaps/${mapData.beatmapset_id}/covers/cover.jpg')`;
        bm.pickid.innerHTML = pick.substring(0,3);
        addEvent(bm);
        beatmapData.add(bm);
    });
    pickRight.map(async(pick, index) => {
        let beatmapId = beatmapSet.find(beatmap => beatmap["pick"] === pick.substring(0,3))["beatmapId"];
        const bm = new Pick(pick.substring(0,3), beatmapId, `rightmap${index}`, false,pick.length == 4 ? true : false);
        bm.generate();
        
        const mapData = await getDataSet(beatmapId);
        bm.mapData = mapData;
        bm.bg.style.backgroundImage = `url('https://assets.ppy.sh/beatmaps/${mapData.beatmapset_id}/covers/cover.jpg')`;
        bm.pickid.innerHTML = pick.substring(0,3);
        addEvent(bm);
        beatmapData.add(bm);
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

async function addEvent(bm) {

    if (bm.isBan) return;

    bm.clicker.addEventListener("click",function(event) {
        if (event.altKey) {
            bm.winnerName.innerHTML = playerOneTemp;
            bm.winContainer.style.backgroundColor = "rgba(0,0,0,0.5)";
            bm.winContainer.style.color = bm.isOne ? bm.pick == "TB" ? "lightyellow" : "lightgreen" : "lightcoral";
            bm.winContainer.style.border = "0px solid white";
            bm.winnerName.style.opacity = "1";
            bm.winnerText.style.opacity = "1";
            bm.clicker.style.animation = null;
            bm.winContainer.style.opacity = "1";
            bm.isPicked = true;
        } else if (event.ctrlKey) {
            bm.winContainer.style.backgroundColor = "rgba(0,0,0,0.5)";
            bm.winContainer.style.color = "white";
            bm.winContainer.style.border = "0px solid white";
            bm.winnerName.style.opacity = "0";
            bm.winnerName.innerHTML = "";
            bm.winnerText.style.opacity = "0";
            bm.clicker.style.animation = null;
            bm.winContainer.style.opacity = "0";
            bm.isPicked = false;
        } else {
            stopPulse();
            bm.winContainer.style.backgroundColor = "rgba(0,0,0,0)";
            bm.winContainer.style.color = "white";
            bm.winContainer.style.border = "5px solid white";
            bm.isOne ? bm.winnerName.innerHTML = `${playerOneTemp} PICK` : bm.winnerName.innerHTML = `${playerTwoTemp} PICK`;
            bm.winnerName.style.opacity = "1";
            bm.winnerText.style.opacity = "0";
            bm.clicker.style.animation = "pick 2s infinite";
            bm.winContainer.style.opacity = "1";
            bm.isPicked = false;
            currentMap = bm;
        }
    })
    bm.clicker.addEventListener("contextmenu",function(event) {
        if (event.altKey) {
            bm.winnerName.innerHTML = playerTwoTemp;
            bm.winContainer.style.backgroundColor = "rgba(0,0,0,0.5)";
            bm.winContainer.style.color = bm.isOne ? bm.pick == "TB" ? "lightyellow" : "lightcoral" : "lightgreen";
            bm.winContainer.style.border = "0px solid white";
            bm.winnerName.style.opacity = "1";
            bm.winnerText.style.opacity = "1";
            bm.clicker.style.animation = null;
            bm.winContainer.style.opacity = "1";
            bm.isPicked = true;
        } else if (event.ctrlKey) {
            bm.winContainer.style.backgroundColor = "rgba(0,0,0,0.5)";
            bm.winContainer.style.color = "white";
            bm.winContainer.style.border = "0px solid white";
            bm.winContainer.style.opacity = "0";
            bm.winnerName.style.opacity = "0";
            bm.winnerName.innerHTML = "";
            bm.winnerText.style.opacity = "0";
            bm.clicker.style.animation = null;
            bm.winContainer.style.opacity = "0";
            bm.isPicked = false;
        } else {
            stopPulse();
            bm.winContainer.style.backgroundColor = "rgba(0,0,0,0)";
            bm.winContainer.style.color = "white";
            bm.winContainer.style.border = "5px solid white";
            bm.isOne ? bm.winnerName.innerHTML = `${playerOneTemp} PICK` : bm.winnerName.innerHTML = `${playerTwoTemp} PICK`;
            bm.winnerName.style.opacity = "1";
            bm.winnerText.style.opacity = "0";
            bm.clicker.style.animation = "pick 2s infinite";
            bm.winContainer.style.opacity = "1";
            bm.isPicked = false;
            currentMap = bm;
        }
    })
}

async function stopPulse() {
    for (let bm of beatmapData) {
        if (!bm.isBan && !bm.isPicked) {
            bm.clicker.style.animation = null;
            bm.winContainer.style.opacity = 0;
        }
    }
}

function revealMap() {
    // console.log(beatmapData.size);
    // console.log(one);
    // console.log(two);
    if (one+two == beatmapData.size) {
        // console.log("happened");
        clearInterval(reveal);
    } else {
        if (one == two) {
            let clickerObj = document.getElementById(`leftmap${one}Clicker`);
            clickerObj.style.opacity = 1;
            clickerObj.style.transform = "translateY(0)";
            one++;
        } else if (one > two && one+two != beatmapData.size) {
            let clickerObj = document.getElementById(`rightmap${two}Clicker`);
            clickerObj.style.opacity = 1;
            clickerObj.style.transform = "translateY(0)";
            two++;
        } else if (one+two == beatmapData.size) {
            clearInterval(reveal);
        }
    }
}

function findNextMapAndClick(currentMap) {
    console.log("happened4");
    if (currentMap.isOne) {
        console.log("happened5");
        for (let tempTwo = 0; tempTwo < two; tempTwo++) {
            let bm = document.getElementById(`rightmap${tempTwo}Clicker`);
            if (!bm.isBan && !bm.isPicked) {
                console.log("happened8");
                bm.clicker.click();
                return;
            }
        }
    } else {
        console.log("happened6");
        for (let tempOne = 0; tempOne < one; tempOne++) {
            let bm = document.getElementById(`leftmap${tempOne}Clicker`);
            if (!bm.isBan && !bm.isPicked) {
                console.log("happened7");
                bm.clicker.click();
                return;
            }
        }
    }
}

// CLASSES /////////////////////////////////////////////////////////
class Pick {
    constructor(pick, beatmapID, layerName, isOne, isBan) {
        this.pick = pick;
        this.beatmapID = beatmapID;
        this.layerName = layerName;
        this.mapData = null;
        this.isOne = isOne;
        this.isBan = isBan;
        this.isPicked = false;
    }
    generate() {
        let mappoolContainer = this.isOne ? document.getElementById(`playerOneColumn`):document.getElementById(`playerTwoColumn`);

        this.clicker = document.createElement("div");
        this.clicker.id = `${this.layerName}Clicker`;

        mappoolContainer.appendChild(this.clicker);
        let clickerObj = document.getElementById(this.clicker.id);

        this.bg = document.createElement("div");
        this.frame = document.createElement("div");
        this.bgContainer = document.createElement("div");
        this.pickid = document.createElement("div");

        this.bg.id = `${this.layerName}BG`;
        this.frame.id = `${this.layerName}FRAME`;
        this.bgContainer.id = `${this.layerName}BGCONTAINER`;
        this.pickid.id = `${this.layerName}PICKID`;

        this.pick != "TB" ? this.bg.setAttribute("class", "bg") : this.bg.setAttribute("class", "bgtb");
        this.pick != "TB" ? this.frame.setAttribute("class", "frame") : this.frame.setAttribute("class", "frametb");
        this.pick != "TB" ? this.bgContainer.setAttribute("class", "bgContainer") : this.bgContainer.setAttribute("class", "bgContainertb");
        this.pickid.setAttribute("class", "pickid");
        this.pick != "TB" ? !this.isBan ? this.clicker.setAttribute("class", "pick") : this.clicker.setAttribute("class", "ban") : this.clicker.setAttribute("class", "tiebreaker");

        clickerObj.appendChild(this.pickid);
        clickerObj.appendChild(this.bgContainer);
        document.getElementById(this.bgContainer.id).appendChild(this.frame);
        document.getElementById(this.bgContainer.id).appendChild(this.bg);

        !this.isBan ? this.generateWin() : null;
    }
    generateWin() {
        let clickerObj = document.getElementById(this.clicker.id);

        this.winContainer = document.createElement("div");
        this.winnerName = document.createElement("div");
        this.winnerText = document.createElement("div");

        this.winContainer.id = `${this.layerName}WIN`;
        this.winnerName.id = `${this.layerName}WINNAME`;
        this.winnerText.id = `${this.layerName}WINTEXT`;

        this.pick != "TB" ? this.winContainer.setAttribute("class", "winContainer") : this.winContainer.setAttribute("class", "winContainertb");
        this.pick != "TB" ? this.winnerName.setAttribute("class", "winnerName") : this.winnerName.setAttribute("class", "winnerNametb");
        this.pick != "TB" ? this.winnerText.setAttribute("class", "winnerText") : this.winnerText.setAttribute("class", "winnerTexttb");

        clickerObj.appendChild(this.winContainer);
        document.getElementById(this.winContainer.id).appendChild(this.winnerName);
        document.getElementById(this.winContainer.id).appendChild(this.winnerText);

        document.getElementById(this.winnerName.id).innerHTML = "PLAYER X";
        document.getElementById(this.winnerText.id).innerHTML = "WINNER";
    }
    grayedOut() {
        this.overlay.style.opacity = '1';
    }
}