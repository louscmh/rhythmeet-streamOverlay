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

const mods = {
    NM: 0,
    HD: 8,
    HR: 16,
    DT: 64,
    FM: 0,
    FL: 1024,
    TB: 0
};

// JSON DATA /////////////////////////////////////////////////////////////////
let beatmapSet = [];
let beatmaps = [];
let seeds = [];
(async () => {
    try {
        const jsonData = await $.getJSON("../_data/beatmaps.json");
        jsonData.map((beatmap) => {
            beatmapSet.push(beatmap);
        });
        const seedData = await $.getJSON("../_data/seed.json");
        seedData.map((seed) => {
            seeds.push(seed);
        });
    } catch (error) {
        console.error("Could not read JSON file", error);
    }
    for (index = 0; index < beatmapSet.length; index++) {
        beatmaps.push(beatmapSet[index]["beatmapId"]);
    }
})();
console.log(beatmapSet);
console.log(beatmaps);
console.log(seeds);

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
let playerOne = document.getElementById("playerOneName");
let playerTwo = document.getElementById("playerTwoName");
let playerOnePic = document.getElementById("playerOnePic");
let playerTwoPic = document.getElementById("playerTwoPic");

let beatmapTitle = document.getElementById("song");
let beatmapTitleDelay = document.getElementById("songDelay");
let beatmapMapper = document.getElementById("mapper");
let mapText = document.getElementById("pickID");
let mapCS = document.getElementById("mapCS");
let mapAR = document.getElementById("mapAR");
let mapOD = document.getElementById("mapOD");
let mapSR = document.getElementById("mapSR");
let mapBPM = document.getElementById("mapBPM");
let mapLength = document.getElementById("mapLength");

let scoreBlue = document.getElementById("scoreBlue");
let scoreRed = document.getElementById("scoreRed");

let score = document.getElementById("score");
let playerOneScore = document.getElementById("playerOneScore");
let playerTwoScore = document.getElementById("playerTwoScore");
let diffLeft = document.getElementById("diffLeft");
let diffRight = document.getElementById("diffRight");

let leftContent = document.getElementById("leftContent");
let rightContent = document.getElementById("rightContent");

let winLeft = document.getElementById("winLeft");
let winRight = document.getElementById("winRight");

let stdButton = document.getElementById("stdButton");
let catchButton = document.getElementById("catchButton");
let maniaButton = document.getElementById("maniaButton");
let taikoButton = document.getElementById("taikoButton");
let clientOneName = document.getElementById("clientOneName");
let clientTwoName = document.getElementById("clientTwoName");

// let goodOne = document.getElementById("goodOne");
// let missOne = document.getElementById("missOne");
// let urOne = document.getElementById("urOne");
// let goodTwo = document.getElementById("goodTwo");
// let missTwo = document.getElementById("missTwo");
// let urTwo = document.getElementById("urTwo");

// let winScreen = document.getElementById("winScreen");
// let winnerName = document.getElementById("winnerName");
// let playerOneFinal = document.getElementById("playerOneFinal");
// let playerTwoFinal = document.getElementById("playerTwoFinal");
// let percentage = document.getElementById("percentage");

let clientOne = document.getElementById("clientOne");
let clientTwo = document.getElementById("clientTwo");
// let statColumnOne = document.getElementById("statColumnOne");
// let statColumnTwo = document.getElementById("statColumnTwo");

let chats = document.getElementById("chats");

// PLACEHOLDER VARS //////////////////////////////////////////////
let tempLeft;
let tempRight;
let tempLeftClient;
let tempRightClient;
let bestOfTemp;
let scoreBlueTemp;
let scoreRedTemp;
let scoreEvent;
let tempBG;
let previousState;
let cachedPlayerOneScore;
let cachedPlayerTwoScore;
let cachedDifference;
let cachedComboOne;
let cachedComboTwo;
let barThreshold = 350000;
let currentTime;
let songStart = false;
let currentMode = "std";

// FOR ANIMATION //////////////////////////////////////////////////
let animationScore = {
	playerOneScore: new CountUp('playerOneScore', 0, 0, 0, .2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
	playerTwoScore: new CountUp('playerTwoScore', 0, 0, 0, .2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    diffLeft: new CountUp('diffLeft', 0, 0, 0, .2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    diffRight: new CountUp('diffRight', 0, 0, 0, .2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    urOne: new CountUp('urOne', 0, 0, 2, { useEasing: true, useGrouping: true, separator: "", decimal: ".", decimalPlaces:2}),
    urTwo: new CountUp('urTwo', 0, 0, 2, { useEasing: true, useGrouping: true, separator: "", decimal: ".", decimalPlaces:2 })
}

// CONTROL PANEL ///////////////////
stdButton.addEventListener("click", function(event) {
    if (currentMode != "std") {
        currentMode = "std";
        stdButton.style.backgroundColor = "rgb(184, 67, 131)";
        catchButton.style.backgroundColor = "pink";
        taikoButton.style.backgroundColor = "pink";
        maniaButton.style.backgroundColor = "pink";
        mapOD.style.display = "";
        mapCS.style.display = "";
        mapAR.style.display = "";
    }
})

catchButton.addEventListener("click", function(event) {
    if (currentMode != "ctb") {
        currentMode = "ctb";
        catchButton.style.backgroundColor = "rgb(184, 67, 131)";
        stdButton.style.backgroundColor = "pink";
        maniaButton.style.backgroundColor = "pink";
        taikoButton.style.backgroundColor = "pink";
        mapOD.style.display = "none";
        mapCS.style.display = "";
        mapAR.style.display = "";
    }
})

taikoButton.addEventListener("click", function(event) {
    if (currentMode != "taiko") {
        currentMode = "taiko";
        taikoButton.style.backgroundColor = "rgb(184, 67, 131)";
        stdButton.style.backgroundColor = "pink";
        catchButton.style.backgroundColor = "pink";
        maniaButton.style.backgroundColor = "pink";
        stdButton.style.backgroundColor = "pink";
        mapOD.style.display = "";
        mapCS.style.display = "none";
        mapAR.style.display = "none";
    }
})

maniaButton.addEventListener("click", function(event) {
    if (currentMode != "mania") {
        currentMode = "mania";
        maniaButton.style.backgroundColor = "rgb(184, 67, 131)";
        stdButton.style.backgroundColor = "pink";
        catchButton.style.backgroundColor = "pink";
        taikoButton.style.backgroundColor = "pink";
        mapOD.style.display = "";
        mapCS.style.display = "none";
        mapAR.style.display = "none";
    }
})

// MAIN LOOP ////////////////////////////////////////////////////////////////
socket.onmessage = async event => {
    let data = JSON.parse(event.data);
    
    // animationScore.playerOneScore.update(1000000);
    // animationScore.playerTwoScore.update(1000000);

    tempLeft = data.tourney.manager.teamName.left;
    tempRight = data.tourney.manager.teamName.right;

    if (previousState != data.tourney.manager.ipcState) {
        checkState(data.tourney.manager.ipcState);
        previousState = data.tourney.manager.ipcState;
    }

    // Player Names
    if (tempLeftClient != data.tourney.ipcClients[0].gameplay.name) {
        tempLeftClient = data.tourney.ipcClients[0].gameplay.name;
        clientOneName.innerHTML = `Client One:${tempLeftClient}`;
    }
    if (tempRightClient != data.tourney.ipcClients[1].gameplay.name) {
        tempRightClient = data.tourney.ipcClients[1].gameplay.name;
        clientTwoName.innerHTML = `Client Two:${tempRightClient}`;
    }

    // Player Names
    if (tempLeft != playerOne.innerHTML) {
        playerOne.innerHTML = tempLeft;
        // adjustFont(playerOne,340,60);
        setPlayerDetails(playerOnePic, tempLeft);
    }
    if (tempRight != playerTwo.innerHTML) {
        playerTwo.innerHTML = tempRight;
        // adjustFont(playerTwo,340,60);
        setPlayerDetails(playerTwoPic, tempRight);
    }

    updateDetails(data);
    makeScrollingText(beatmapTitle, beatmapTitleDelay,16,630,40);

    if (data.tourney.manager.bools.scoreVisible) {
        updateScore(data.tourney.manager.gameplay.score.left, data.tourney.manager.gameplay.score.right);
        updateClientStats(data.tourney.ipcClients);
    }

    if (bestOfTemp !== Math.ceil(data.tourney.manager.bestOF / 2) || scoreBlueTemp !== data.tourney.manager.stars.left || scoreRedTemp !== data.tourney.manager.stars.right) {

		// Courtesy of Victim-Crasher
		bestOfTemp = Math.ceil(data.tourney.manager.bestOF / 2);

		// To know where to blow or pop score
		if (scoreBlueTemp < data.tourney.manager.stars.left) {
			scoreEvent = "blue-add";
		} else if (scoreBlueTemp > data.tourney.manager.stars.left) {
			scoreEvent = "blue-remove";
		} else if (scoreRedTemp < data.tourney.manager.stars.right) {
			scoreEvent = "red-add";
		} else if (scoreRedTemp > data.tourney.manager.stars.right) {
			scoreEvent = "red-remove";
		}

		scoreBlueTemp = data.tourney.manager.stars.left;
		scoreBlue.innerHTML = "";
		for (var i = 0; i < scoreBlueTemp; i++) {
			if (scoreEvent === "blue-add" && i === scoreBlueTemp - 1) {
				let scoreFill = document.createElement("div");
				scoreFill.setAttribute("class", "score scoreFillAnimate");
				scoreBlue.appendChild(scoreFill);
			} else {
				let scoreFill = document.createElement("div");
				scoreFill.setAttribute("class", "score scoreFill");
				scoreBlue.appendChild(scoreFill);
			}
		}
		for (var i = 0; i < bestOfTemp - scoreBlueTemp; i++) {
			if (scoreEvent === "blue-remove" && i === 0) {
				let scoreNone = document.createElement("div");
				scoreNone.setAttribute("class", "score scoreNoneAnimate");
				scoreBlue.appendChild(scoreNone);
			} else {
				let scoreNone = document.createElement("div");
				scoreNone.setAttribute("class", "score");
				scoreBlue.appendChild(scoreNone);
			}
		}

		scoreRedTemp = data.tourney.manager.stars.right;
		scoreRed.innerHTML = "";
		for (var i = 0; i < bestOfTemp - scoreRedTemp; i++) {
			if (scoreEvent === "red-remove" && i === bestOfTemp - scoreRedTemp - 1) {
				let scoreNone = document.createElement("div");
				scoreNone.setAttribute("class", "score scoreNoneAnimate");
				scoreRed.appendChild(scoreNone);
			} else {
				let scoreNone = document.createElement("div");
				scoreNone.setAttribute("class", "score");
				scoreRed.appendChild(scoreNone);
			}
		}
		for (var i = 0; i < scoreRedTemp; i++) {
			if (scoreEvent === "red-add" && i === 0) {
				let scoreFill = document.createElement("div");
				scoreFill.setAttribute("class", "score scoreFillAnimate");
				scoreRed.appendChild(scoreFill);
			} else {
				let scoreFill = document.createElement("div");
				scoreFill.setAttribute("class", "score scoreFill");
				scoreRed.appendChild(scoreFill);
			}
		}
	}
}

// FUNCTIONS ////////////////////////////////////////////////////////////////
async function updateDetails(data) {
	let { id } = data.menu.bm;
	let { memoryAR, memoryCS, memoryOD, fullSR, BPM: { min, max } } = data.menu.bm.stats;
	let { full } = data.menu.bm.time;
    let { difficulty, mapper, artist, title } = data.menu.bm.metadata;
    let pick;
    let customMapper = "";

    // CHECKER FOR MAPPICK & MODS (TO RECALCULATE STATS)
    if (beatmaps.includes(id)) {
        pick = beatmapSet.find(beatmap => beatmap["beatmapId"] === id)["pick"];
        customMapper = beatmapSet.find(beatmap => beatmap["beatmapId"] === id)["mappers"];
        let mod = pick.substring(0,2).toUpperCase();
        if (mod == "HR") {
            memoryOD = Math.min(memoryOD*1.4, 10).toFixed(1);
            memoryCS = Math.min(memoryCS*1.3, 10).toFixed(1);
            memoryAR = Math.min(memoryAR*1.4, 10).toFixed(1);
            fullSR = beatmapSet.find(beatmap => beatmap["beatmapId"] === id)["modSR"];
        } else if (mod == "DT") {
            // thanks schdewz
            memoryOD = Math.min((79.5 - (Math.min(79.5, Math.max(19.5, 79.5 - Math.ceil(6 * memoryOD))) / 1.5)) / 6, 1.5 > 1.5 ? 12 : 11).toFixed(1);
            let ar_ms = Math.max(Math.min(memoryAR <= 5 ? 1800 - 120 * memoryAR : 1200 - 150 * (memoryAR - 5), 1800), 450) / 1.5;
            memoryAR = ar_ms > 1200 ? ((1800 - ar_ms) / 120).toFixed(2) : (5 + (1200 - ar_ms) / 150).toFixed(1);
        
            min = Math.round(min * 1.5);
            max = Math.round(max * 1.5);
            full = Math.round(full/1.5);
        
            fullSR = beatmapSet.find(beatmap => beatmap["beatmapId"] === id)["modSR"];
        }
    }
    
    mapText.innerHTML = pick == null ? "XX1" : pick;
    // paintMod(pick);

    beatmapTitle.innerHTML = `${artist} - ${title}`;
    beatmapMapper.innerHTML = customMapper != "" ? `Mapped by ${customMapper}`:`Mapset by ${mapper}`;
    mapOD.innerHTML = `OD ${memoryOD}`;
    mapCS.innerHTML = `CS ${memoryCS}`;
    mapAR.innerHTML = `AR ${memoryAR}`;
    mapSR.innerHTML = `SR ${fullSR}*`;
    mapBPM.innerHTML = `BPM ${min === max ? min : `${min}-${max}`}`;
    mapLength.innerHTML = `Length ${parseTime(full)}`;

    data.menu.bm.path.full = data.menu.bm.path.full.replace(/#/g,'%23').replace(/%/g,'%25');
}

async function setPlayerDetails(element, username) {
    if (username === "") {
        return false;
    }

    const data = await getUserDataSet(username);
    if (data !== null) {
        source = `http://s.ppy.sh/a/${data.user_id}`
        element.setAttribute('src',source);
        playerSeed = seeds.find(seed => seed["playerID"] == data.user_id)["Seed"];
        return true;
    } else {
        return false;
    }
}

async function getUserDataSet(name) {
    try {
        const data = (
            await axios.get("/get_user", {
                baseURL: "https://osu.ppy.sh/api",
                params: {
                    k: api,
                    u: name,
                    m: 1,
                },
            })
        )["data"];
        return data.length !== 0 ? data[0] : null;
    } catch (error) {
        console.error(error);
    }
}

const parseTime = ms => {
	const second = Math.floor(ms / 1000) % 60 + '';
	const minute = Math.floor(ms / 1000 / 60) + '';
	return `${'0'.repeat(2 - minute.length) + minute}:${'0'.repeat(2 - second.length) + second}`;
}

async function updateScore(playScoreOne, playScoreTwo) {
    difference = Math.abs(playScoreOne-playScoreTwo);
    // animationScore.playerOneScore.update(1000000);
    // animationScore.playerTwoScore.update(1000000);
    animationScore.playerOneScore.update(playScoreOne);
    animationScore.playerTwoScore.update(playScoreTwo);
    animationScore.diffLeft.update(difference);
    animationScore.diffRight.update(difference);
    cachedPlayerOneScore = playScoreOne;
    cachedPlayerTwoScore = playScoreTwo;
    cachedDifference = difference;
    if (playScoreOne > playScoreTwo) {
        leftContent.style.width = `${(difference/barThreshold > 1 ? 1 : difference/barThreshold)*710}px`;
        rightContent.style.width = "0px";
        diffLeft.style.opacity = 1;
        diffRight.style.opacity = 0;
        // playerOneScore.style.animation = "highlightScore 0.5s ease-in-out";
        // playerOneScore.style.color = "white";
        // playerOneScore.style.transform = "scale(1)";
        // playerTwoScore.style.animation = "unhighlightScore 0.5s ease-in-out";
        // playerTwoScore.style.color = "rgb(150,150,150)";
        // playerTwoScore.style.transition = "scale(0.9)";
    } else if (playScoreOne < playScoreTwo) {
        rightContent.style.width = `${(difference/barThreshold > 1 ? 1 : difference/barThreshold)*710}px`;
        leftContent.style.width = "0px";
        diffRight.style.opacity = 1;
        diffLeft.style.opacity = 0;
        // playerTwoScore.style.animation = "highlightScore 0.5s ease-in-out";
        // playerTwoScore.style.color = "white";
        // playerTwoScore.style.transform = "scale(1)";
        // playerOneScore.style.animation = "unhighlightScore 0.5s ease-in-out";
        // playerOneScore.style.color = "rgb(150,150,150)";
        // playerOneScore.style.transition = "scale(0.9)";
    } else {
        leftContent.style.width = "0px";
        rightContent.style.width = "0px";
        diffRight.style.opacity = 0;
        diffLeft.style.opacity = 0;
    }
}

async function updateClientStats(data) {
    playerOneData = data[0].gameplay;
    playerTwoData = data[1].gameplay;

    // animationScore.urOne.update(playerOneData.hits.unstableRate);
    // animationScore.urTwo.update(playerTwoData.hits.unstableRate);
    // console.log("current: "+playerOneData.combo.current);
    // console.log("cached: "+cachedComboOne);

    if (playerOneData.combo.current < cachedComboOne && cachedComboOne > 100) {
        // console.log("happened");
        flashMiss(true);
    }
    if (playerTwoData.combo.current < cachedComboTwo && cachedComboTwo > 100) {
        flashMiss(false);
    }
    
    cachedComboOne = playerOneData.combo.current;
    cachedComboTwo = playerTwoData.combo.current;

    // goodOne.innerHTML = playerOneData.hits["100"];
    // missOne.innerHTML = playerOneData.hits["0"];
    // goodTwo.innerHTML = playerTwoData.hits["100"];
    // missTwo.innerHTML = playerTwoData.hits["0"];
}

async function makeScrollingText(title, titleDelay, rate, boundaryWidth, padding) {
    if (title.scrollWidth > boundaryWidth) {
        titleDelay.innerHTML = title.innerHTML;
		let ratio = (title.scrollWidth/boundaryWidth)*rate
		title.style.animation = `scrollText ${ratio}s linear infinite`;
		titleDelay.style.animation = `scrollText ${ratio}s linear infinite`;
		titleDelay.style.animationDelay = `${-ratio/2}s`;
		titleDelay.style.paddingRight = `${padding}px`;
		title.style.paddingRight = `${padding}px`;
        titleDelay.style.marginTop = `-${title.offsetHeight}px`;
        titleDelay.style.display = "initial";
    } else {
        titleDelay.style.display = "none";
		title.style.animation = "none";
		titleDelay.style.animation = "none";
		titleDelay.style.paddingRight = "0px";
        titleDelay.style.marginTop = `0px`;
		title.style.paddingRight = "0px";
	}
}

async function checkState(ipcState) {
    if (ipcState == 3) {
        score.style.opacity = 1;
        winLeft.style.opacity = 0;
        winRight.style.opacity = 0;
        // statColumnOne.style.animation ="statIn 1s ease-in-out";
        // statColumnTwo.style.animation ="statIn 1s ease-in-out";
        // statColumnOne.style.opacity = 1;
        // statColumnTwo.style.opacity = 1;
    } else if (ipcState == 4 & cachedPlayerOneScore != cachedPlayerTwoScore) {
        let oneWinner = cachedPlayerOneScore > cachedPlayerTwoScore ? true : false;
        winLeft.style.opacity = oneWinner ? 1 : 0;
        winRight.style.opacity = oneWinner ? 0 : 1;
        // playerOneFinal.innerHTML = cachedPlayerOneScore;
        // playerTwoFinal.innerHTML = cachedPlayerTwoScore;
        // playerOneFinal.style.color = oneWinner?"white":"rgb(150,150,150)";
        // playerTwoFinal.style.color = !oneWinner?"white":"rgb(150,150,150)";
        score.style.opacity = 1;
        // let ratio = oneWinner?cachedDifference/cachedPlayerOneScore:cachedDifference/cachedPlayerTwoScore;
        // winnerName.innerHTML = cachedPlayerOneScore > cachedPlayerTwoScore ? playerOne.innerHTML : playerTwo.innerHTML;
        // winnerName.style.color = cachedPlayerOneScore > cachedPlayerTwoScore ? "#900f93" : "#377a17";
        // percentage.innerHTML = `${(ratio*100).toFixed(2)}%`;
        // winScreen.style.animation = "moveUp 1s ease-in-out";
        // winScreen.style.transform = "translateY(-275px)";
        // statColumnOne.style.animation ="statOut 1s ease-in-out";
        // statColumnTwo.style.animation ="statOut 1s ease-in-out";
        // statColumnOne.style.opacity = 0;
        // statColumnTwo.style.opacity = 0;
    } else {
        // winScreen.style.animation = "moveDown 1s ease-in-out";
        // winScreen.style.transform = "translateY(0px)";
        winLeft.style.opacity = 0;
        winRight.style.opacity = 0;
        score.style.opacity = 0;
        // statColumnOne.style.animation ="statOut 1s ease-in-out";
        // statColumnTwo.style.animation ="statOut 1s ease-in-out";
        // statColumnOne.style.opacity = 0;
        // statColumnTwo.style.opacity = 0;
    }
}

async function flashMiss(playerOneYes) {
    if (playerOneYes) {
        console.log("happened");
        clientOne.style.animation = "flashMissOne 1s ease-in-out";
        leftContent.style.animation = "flashMissBarOne 1s ease-in-out";
        setTimeout(function() {
            clientOne.style.animation = "";
            leftContent.style.animation = "";
        },1000);
    } else {
        console.log("happened");
        clientTwo.style.animation = "flashMissTwo 1s ease-in-out";
        rightContent.style.animation = "flashMissBarTwo 1s ease-in-out";
        setTimeout(function() {
            clientTwo.style.animation = "";
            rightContent.style.animation = "";
        },1000);
    }
}

async function paintMod(modText) {
    if (modText != null) {
        switch (modText.substring(0,2)) {
            case "NM":
                mapPick.style.borderColor = "rgb(147, 165, 202)";
                mapPick.style.backgroundColor = "#18242f";
                break;
            case "HD":
                mapPick.style.borderColor = "rgb(202, 194, 147)";
                mapPick.style.backgroundColor = "#2d2f18";
                break;
            case "HR":
                mapPick.style.borderColor = "rgb(202, 147, 147)";
                mapPick.style.backgroundColor = "#2f1818";
                break;
            case "DT":
                mapPick.style.borderColor = "rgb(185, 147, 202)";
                mapPick.style.backgroundColor = "#2a182f";
                break;
            case "FM":
                mapPick.style.borderColor = "rgb(147, 202, 147)";
                mapPick.style.backgroundColor = "#182f18";
                break;
            case "FL":
                mapPick.style.borderColor = "rgb(201, 201, 201)";
                mapPick.style.backgroundColor = "#303030";
                break;
            default:
                break;
        }
    } else {
        mapPick.style.borderColor = "white";
        mapPick.style.backgroundColor = "#313131";
    }
}

async function adjustFont(title, boundaryWidth, originalFontSize) {
    if (title.scrollWidth > boundaryWidth) {
		let ratio = (title.scrollWidth/boundaryWidth);
        title.style.fontSize = `${originalFontSize/ratio}px`;
    } else {
		title.style.fontSize = `${originalFontSize}px`;
	}
}