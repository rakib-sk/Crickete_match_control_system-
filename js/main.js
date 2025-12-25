let currentMatch = null;
let history = JSON.parse(localStorage.getItem("history")) || [];
let undoStack = [], redoStack = [];
let batsmen = {}, wicketList = [], bowlers = {}, strikerName = "", currentBowler = "", totalMatchBalls = 0;

const teamA = document.getElementById("teamA");
const teamB = document.getElementById("teamB");
const battingSelect = document.getElementById("battingSelect");
const score = document.getElementById("score");
const over = document.getElementById("over");
const batting = document.getElementById("batting");
const inningsTxt = document.getElementById("innings");
const commentaryDiv = document.getElementById("commentary");
const historyDiv = document.getElementById("history");

// Load saved inputs
window.addEventListener("load", ()=>{
    const savedInputs = JSON.parse(localStorage.getItem("inputs")) || {};
    if(savedInputs.teamA) teamA.value = savedInputs.teamA;
    if(savedInputs.teamB) teamB.value = savedInputs.teamB;
    if(savedInputs.battingTeam){
        battingSelect.innerHTML = `<option value="">Select Batting Team</option>
            <option value="${teamA.value}">${teamA.value}</option>
            <option value="${teamB.value}">${teamB.value}</option>`;
        battingSelect.value = savedInputs.battingTeam;
    }
    loadFromLocal();
    renderAll();
});

// Save input fields persistently
[teamA, teamB, battingSelect].forEach(input=>{
    input.addEventListener("input", saveInputs);
});

function saveInputs(){
    localStorage.setItem("inputs", JSON.stringify({
        teamA: teamA.value,
        teamB: teamB.value,
        battingTeam: battingSelect.value
    }));
}

// Team select options update
teamA.oninput = teamB.oninput = ()=>{
    battingSelect.innerHTML = `<option value="">Select Batting Team</option>
        <option value="${teamA.value}">${teamA.value}</option>
        <option value="${teamB.value}">${teamB.value}</option>`;
    saveInputs();
};

// Start match
function startMatch(){
    if(!teamA.value || !teamB.value || !battingSelect.value) return alert("Fill all fields");
    currentMatch = {teamA:teamA.value,teamB:teamB.value,battingTeam:battingSelect.value,innings:1,target:null,runs:0,wickets:0,balls:0,commentary:[]};
    undoStack=[]; redoStack=[]; batsmen={}; wicketList=[]; bowlers={}; strikerName=""; currentBowler=""; totalMatchBalls=0;
    saveToLocal();
    renderAll();
}

// Save match state to localStorage
function saveToLocal(){
    localStorage.setItem("currentMatch", JSON.stringify({
        match: currentMatch, batsmen, wicketList, bowlers, strikerName, currentBowler, totalMatchBalls
    }));
}

// Load match state from localStorage
function loadFromLocal(){
    const data = JSON.parse(localStorage.getItem("currentMatch"));
    if(data){
        currentMatch = data.match;
        batsmen = data.batsmen;
        wicketList = data.wicketList;
        bowlers = data.bowlers;
        strikerName = data.strikerName;
        currentBowler = data.currentBowler;
        totalMatchBalls = data.totalMatchBalls;
    }
}

// Undo / Redo
function pushState(){ undoStack.push(JSON.stringify(currentMatch)); if(undoStack.length>12) undoStack.shift(); redoStack=[]; }

function undo(){
    if(!undoStack.length) return;
    redoStack.push(JSON.stringify(currentMatch));
    let prev = JSON.parse(undoStack.pop());
    currentMatch = prev;
    loadFromLocal();
    renderAll();
}

function redo(){
    if(!redoStack.length) return;
    undoStack.push(JSON.stringify(currentMatch));
    let next = JSON.parse(redoStack.pop());
    currentMatch = next;
    loadFromLocal();
    renderAll();
}

// Commentary
function addComment(text){ 
    const o=`${Math.floor(currentMatch.balls/6)}.${currentMatch.balls%6}`;
    currentMatch.commentary.unshift(`${o} - ${text}`);
}

// Add Run
function run(r){
    if(!currentMatch || !strikerName || !currentBowler) return alert("Select striker & bowler");
    pushState();

    batsmen[strikerName].runs+=r;
    batsmen[strikerName].balls++;
    bowlers[currentBowler].balls++;
    bowlers[currentBowler].runs+=r;
    currentMatch.runs+=r;
    currentMatch.balls++;
    totalMatchBalls++;

    addComment(`${strikerName} scored ${r}`);

    if(r===1 || r===3) changeStriker();

    if(bowlers[currentBowler].balls %6===0){
        let newBowler = prompt("Over completed! Enter new bowler name");
        if(!newBowler) return alert("Add new bowler to continue!");
        currentBowler = newBowler;
        if(!bowlers[currentBowler]) bowlers[currentBowler]={balls:0,runs:0};
    }

    saveToLocal();
    renderAll();
}

// Extra Ball
function extra(){
    if(!currentMatch) return;
    pushState();
    currentMatch.runs++;
    addComment("Wide ball");
    saveToLocal();
    renderAll();
}

// Wicket
function wicket(){
    if(!strikerName) return;
    pushState();
    wicketList.push({name:strikerName,runs:batsmen[strikerName].runs});
    delete batsmen[strikerName];
    currentMatch.wickets++;
    let newBat = prompt("New batsman name:");
    if(newBat){batsmen[newBat]={runs:0,balls:0}; strikerName=newBat;}
    saveToLocal();
    renderAll();
}

// Striker change
function changeStriker(){
    let keys = Object.keys(batsmen);
    for(let k of keys){
        if(k !== strikerName){
            strikerName = k; break;
        }
    }
    updateStriker();
}

// Add Batsmen
function addBatsmen(){
    let b1=document.getElementById("bat1").value.trim();
    let b2=document.getElementById("bat2").value.trim();
    if(!b1 || !b2) return alert("Enter both batsmen");
    batsmen[b1]={runs:0,balls:0};
    batsmen[b2]={runs:0,balls:0};
    strikerName=b1;
    updateStriker();
    saveToLocal();
    renderAll();
}

// Update striker select box
function updateStriker(){ 
    const s=document.getElementById("strikerSelect");
    s.innerHTML="";
    for(let b in batsmen){ s.innerHTML+=`<option value="${b}">${b}</option>`; }
    s.value=strikerName;
}
document.getElementById("strikerSelect").onchange=e=>{strikerName=e.target.value;}

// Add Bowler
function addBowler(){ 
    let name=document.getElementById("bowlerInput").value.trim();
    if(!name) return;
    if(!bowlers[name]) bowlers[name]={balls:0,runs:0};
    currentBowler=name;
    saveToLocal();
    renderAll();
}

// Render Tables
function renderBatters(){ const t=document.getElementById("batTable"); t.innerHTML=""; for(let b in batsmen){ t.innerHTML+=`<tr><td>${b}</td><td>${batsmen[b].runs}</td><td>${batsmen[b].balls}</td></tr>`; } }
function renderWickets(){ const t=document.getElementById("wicketTable"); t.innerHTML=""; wicketList.forEach(w=>{ t.innerHTML+=`<tr><td>${w.name}</td><td>${w.runs}</td></tr>`; }); }
function renderBowlers(){ const t=document.getElementById("bowlTable"); t.innerHTML=""; for(let b in bowlers){ t.innerHTML+=`<tr><td>${b}</td><td>${bowlers[b].balls}</td><td>${bowlers[b].runs}</td></tr>`; } }
function updateSummary(){ document.getElementById("totalBalls").innerText=totalMatchBalls; document.getElementById("totalBatters").innerText=Object.keys(batsmen).length + wicketList.length; }

// Render All
function renderAll(){
    if(!currentMatch){ 
        score.innerText="0/0"; over.innerText="Overs:0.0"; batting.innerText=""; inningsTxt.innerText=""; commentaryDiv.innerHTML="<p class='small'>No commentary</p>"; 
    } else{
        score.innerText=`${currentMatch.runs}/${currentMatch.wickets}`;
        over.innerText=`Overs:${Math.floor(currentMatch.balls/6)}.${currentMatch.balls%6}`;
        batting.innerText=`Batting:${currentMatch.battingTeam}`;
        inningsTxt.innerText=`Innings:${currentMatch.innings}`;
        commentaryDiv.innerHTML=currentMatch.commentary.slice(0,10).map(c=>`<div>${c}</div>`).join("");
    }
    renderBatters(); renderWickets(); renderBowlers(); updateSummary();
    if(!history.length){ historyDiv.innerHTML="<p class='small'>No match history</p>"; return; }
    let table=`<table><tr><th>Teams</th><th>Winner</th><th>Target</th><th>Score</th></tr>`;
    history.forEach(h=>{ table+=`<tr><td>${h.teamA} vs ${h.teamB}</td><td>${h.winner}</td><td>${h.target}</td><td>${h.score}</td></tr>`; });
    table+="</table>"; historyDiv.innerHTML=table;
}

// End Innings
function endMatch(){
    if(!currentMatch) return alert("No match running!");
    
    if(currentMatch.innings === 1){
        currentMatch.target = currentMatch.runs + 1; 
        currentMatch.innings = 2;
        currentMatch.runs = 0;
        currentMatch.wickets = 0;
        currentMatch.balls = 0;
        batsmen = {};
        wicketList = [];
        bowlers = {};
        strikerName = "";
        currentBowler = "";
        totalMatchBalls = 0;
        addComment("End of 1st innings. 2nd innings begins!");
        saveToLocal();
        renderAll();
        return;
    }

    let winner = "";
    if(currentMatch.runs >= currentMatch.target){
        winner = currentMatch.battingTeam;
    } else {
        winner = currentMatch.battingTeam === currentMatch.teamA ? currentMatch.teamB : currentMatch.teamA;
    }

    history.unshift({
        teamA: currentMatch.teamA,
        teamB: currentMatch.teamB,
        winner: winner,
        target: currentMatch.target,
        score: `${currentMatch.runs}/${currentMatch.wickets}`
    });
    localStorage.setItem("history", JSON.stringify(history));

    alert(`Match Ended! Winner: ${winner}`);

    currentMatch = null;
    batsmen = {};
    wicketList = [];
    bowlers = {};
    strikerName = "";
    currentBowler = "";
    totalMatchBalls = 0;
    localStorage.removeItem("currentMatch");

    renderAll();
}

// Clear Match History
function clearHistory() {
    if(confirm("Are you sure you want to delete all match history?")) {
        history = [];
        localStorage.removeItem("history");
        renderAll();
    }
}