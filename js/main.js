let currentMatch = null;
let history = JSON.parse(localStorage.getItem("history")) || [];
let inningsData = JSON.parse(localStorage.getItem("inningsData")) || [];
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
const inningsSummaryDiv = document.getElementById("inningsSummary");

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

// Save inputs persistently
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

// Update batting options
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

// Save/Load
function saveToLocal(){
    localStorage.setItem("currentMatch", JSON.stringify({
        match: currentMatch, batsmen, wicketList, bowlers, strikerName, currentBowler, totalMatchBalls
    }));
    localStorage.setItem("inningsData", JSON.stringify(inningsData));
}
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
function pushState(){ 
    undoStack.push(JSON.stringify({match:currentMatch,batsmen,wicketList,bowlers,strikerName,currentBowler,totalMatchBalls}));
    if(undoStack.length>20) undoStack.shift();
    redoStack=[];
}
function undo(){
    if(!undoStack.length) return;
    redoStack.push(JSON.stringify({match:currentMatch,batsmen,wicketList,bowlers,strikerName,currentBowler,totalMatchBalls}));
    let prev = JSON.parse(undoStack.pop());
    currentMatch = prev.match;
    batsmen = prev.batsmen;
    wicketList = prev.wicketList;
    bowlers = prev.bowlers;
    strikerName = prev.strikerName;
    currentBowler = prev.currentBowler;
    totalMatchBalls = prev.totalMatchBalls;
    renderAll();
}
function redo(){
    if(!redoStack.length) return;
    undoStack.push(JSON.stringify({match:currentMatch,batsmen,wicketList,bowlers,strikerName,currentBowler,totalMatchBalls}));
    let next = JSON.parse(redoStack.pop());
    currentMatch = next.match;
    batsmen = next.batsmen;
    wicketList = next.wicketList;
    bowlers = next.bowlers;
    strikerName = next.strikerName;
    currentBowler = next.currentBowler;
    totalMatchBalls = next.totalMatchBalls;
    renderAll();
}

// Commentary
function addComment(text){ 
    const o=`${Math.floor(currentMatch.balls/6)}.${currentMatch.balls%6}`;
    commentaryDiv.innerHTML = `<div>${o} - ${text}</div>` + commentaryDiv.innerHTML;
}

// Run logic
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
    if([1,3].includes(r)) changeStriker();
    if(bowlers[currentBowler].balls %6===0){
        let newBowler = prompt("Over completed! Enter new bowler name");
        if(!newBowler) return alert("Add new bowler!");
        currentBowler = newBowler;
        if(!bowlers[currentBowler]) bowlers[currentBowler]={balls:0,runs:0};
        changeStriker();
    }
    saveToLocal();
    renderAll();
}

// Extra
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
    addComment(`<span style="color:red">${strikerName} WICKET!</span>`);
    delete batsmen[strikerName];
    currentMatch.wickets++;
    let newBat = prompt("New batsman name:");
    if(newBat){batsmen[newBat]={runs:0,balls:0}; strikerName=newBat;}
    saveToLocal();
    renderAll();
}

// Change striker
function changeStriker(){
    let keys = Object.keys(batsmen);
    for(let k of keys){
        if(k !== strikerName){ strikerName = k; break; }
    }
    updateStriker();
}

// Add batsmen
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

// Update striker select
function updateStriker(){ 
    const s=document.getElementById("strikerSelect");
    s.innerHTML="";
    for(let b in batsmen){ s.innerHTML+=`<option value="${b}">${b}</option>`; }
    s.value=strikerName;
}
document.getElementById("strikerSelect").onchange=e=>{strikerName=e.target.value;}

// Add bowler
function addBowler(){ 
    let name=document.getElementById("bowlerInput").value.trim();
    if(!name) return;
    if(!bowlers[name]) bowlers[name]={balls:0,runs:0};
    currentBowler=name;
    saveToLocal();
    renderAll();
}

// Render tables
function renderBatters(){ 
    const t=document.getElementById("batTable"); 
    t.innerHTML=""; 
    for(let b in batsmen){ 
        t.innerHTML+=`<tr><td>${b}</td><td>${batsmen[b].runs}</td><td>${batsmen[b].balls}</td></tr>`; 
    } 
}
function renderWickets(){ 
    const t=document.getElementById("wicketTable"); 
    t.innerHTML=""; 
    wicketList.forEach(w=>{
        t.innerHTML+=`<tr><td>${w.name}</td><td>${w.runs}</td></tr>`; 
    }); 
}
function renderBowlers(){ 
    const t=document.getElementById("bowlTable"); 
    t.innerHTML=""; 
    for(let b in bowlers){ 
        t.innerHTML+=`<tr><td>${b}</td><td>${bowlers[b].balls}</td><td>${bowlers[b].runs}</td></tr>`; 
    } 
}
function updateSummary(){ 
    document.getElementById("totalBalls").innerText=totalMatchBalls; 
    document.getElementById("totalBatters").innerText=Object.keys(batsmen).length + wicketList.length; 
}

// Render all
function renderAll(){
    if(!currentMatch){ 
        score.innerText="0/0"; over.innerText="Overs:0.0"; batting.innerText=""; inningsTxt.innerText=""; commentaryDiv.innerHTML="<p class='small'>No commentary</p>"; 
    } else{
        score.innerText=`${currentMatch.runs}/${currentMatch.wickets}`;
        over.innerText=`Overs:${Math.floor(currentMatch.balls/6)}.${currentMatch.balls%6}`;
        batting.innerText=`Batting:${currentMatch.battingTeam}`;
        inningsTxt.innerText=`Innings:${currentMatch.innings}`;
    }
    renderBatters(); renderWickets(); renderBowlers(); updateSummary();

    // Match History
    if(!history.length){ historyDiv.innerHTML="<p class='small'>No match history</p>"; } 
    else {
        let table=`<table><tr><th>Teams</th><th>Winner</th><th>Target</th><th>Score</th></tr>`;
        history.forEach(h=>{ 
            table+=`<tr><td>${h.teamA} vs ${h.teamB}</td><td>${h.winner}</td><td>${h.target}</td><td>${h.score}</td></tr>`; 
        });
        table+="</table>"; 
        historyDiv.innerHTML=table;
    }

    // Innings Summary
    if(!inningsData.length){ inningsSummaryDiv.innerHTML="<p class='small'>No innings summary</p>"; }
    else{
        let table=`<table><tr><th>Innings</th><th>Batsman</th><th>Runs</th><th>Balls</th><th>Bowler</th><th>Balls</th><th>Runs</th></tr>`;
        inningsData.forEach(inning=>{
            for(let b in inning.batsmen){
                table+=`<tr><td>${inning.innings}</td><td>${b}</td><td>${inning.batsmen[b].runs}</td><td>${inning.batsmen[b].balls}</td><td>${Object.keys(inning.bowlers).join(',')}</td><td>${Object.values(inning.bowlers).reduce((a,v)=>a+v.balls,0)}</td><td>${Object.values(inning.bowlers).reduce((a,v)=>a+v.runs,0)}</td></tr>`;
            }
        });
        table+="</table>"; 
        inningsSummaryDiv.innerHTML=table;
    }
}

// End innings / match
function endMatch(){
    if(!currentMatch) return alert("No match running!");
    
    inningsData.unshift({innings:currentMatch.innings, batsmen:JSON.parse(JSON.stringify(batsmen)), bowlers:JSON.parse(JSON.stringify(bowlers))});

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

    let winner = currentMatch.runs >= currentMatch.target ? currentMatch.battingTeam : (currentMatch.battingTeam===currentMatch.teamA ? currentMatch.teamB : currentMatch.teamA);

    history.unshift({
        teamA: currentMatch.teamA,
        teamB: currentMatch.teamB,
        winner: winner,
        target: currentMatch.target,
        score: `${currentMatch.runs}/${currentMatch.wickets}`
    });
    localStorage.setItem("history", JSON.stringify(history));
    saveToLocal();

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

// Clear History
function clearHistory() {
    if(confirm("Are you sure you want to delete all match history?")) {
        history = [];
        inningsData = [];
        localStorage.removeItem("history");
        localStorage.removeItem("inningsData");
        localStorage.removeItem("currentMatch");
        renderAll();
    }
}