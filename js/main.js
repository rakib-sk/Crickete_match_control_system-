let currentMatch = JSON.parse(localStorage.getItem("currentMatch")) || null;
let history = JSON.parse(localStorage.getItem("history")) || [];

teamA.oninput = teamB.oninput = () => {
    battingSelect.innerHTML =
        `<option value="">Select Batting Team</option>
         <option value="${teamA.value}">${teamA.value}</option>
         <option value="${teamB.value}">${teamB.value}</option>`;
};

function startMatch() {
    if(!teamA.value || !teamB.value || !battingSelect.value) {
        alert("Fill all fields");
        return;
    }
    currentMatch = {
        teamA: teamA.value,
        teamB: teamB.value,
        battingTeam: battingSelect.value,
        runs: 0,
        wickets: 0,
        balls: 0
    };
    save(); render();
}

function run(r) {
    if(!currentMatch) return;
    currentMatch.runs += r;
    currentMatch.balls++;
    save(); render();
}

function extra() {
    if(!currentMatch) return;
    currentMatch.runs++; // Wide runs
    // balls++ না → over ঠিক থাকে
    save(); render();
}

function wicket() {
    if(!currentMatch) return;
    currentMatch.wickets++;
    currentMatch.balls++;
    save(); render();
}

function endMatch() {
    if(!currentMatch) return;
    const opponent = currentMatch.battingTeam === currentMatch.teamA ? currentMatch.teamB : currentMatch.teamA;
    history.unshift({
        ...currentMatch,
        opponent,
        target: currentMatch.runs + 1
    });
    currentMatch = null;
    save(); render();
}

function resetCurrent() {
    currentMatch = null;
    save(); render();
}

function deleteHistory(i) {
    history.splice(i,1);
    save(); render();
}

function render() {
    if(currentMatch) {
        score.innerText = `${currentMatch.runs}/${currentMatch.wickets}`;
        over.innerText = `Overs: ${Math.floor(currentMatch.balls/6)}.${currentMatch.balls%6}`;
        batting.innerText = `Batting: ${currentMatch.battingTeam}`;
    } else {
        score.innerText = "0/0";
        over.innerText = "Overs: 0.0";
        batting.innerText = "";
    }

    if(history.length === 0) {
        historyDiv.innerHTML = "<p class='small'>No matches yet.</p>";
        return;
    }

    let table = `<table>
        <tr><th>Batting Team</th><th>Runs/Wickets</th><th>Overs</th><th>Opponent</th><th>Target</th><th>Action</th></tr>`;
    history.forEach((m,i)=>{
        const overs = `${Math.floor(m.balls/6)}.${m.balls%6}`;
        table += `<tr>
            <td>${m.battingTeam}</td>
            <td>${m.runs}/${m.wickets}</td>
            <td>${overs}</td>
            <td>${m.opponent}</td>
            <td>${m.target}</td>
            <td><button class="red" onclick="deleteHistory(${i})">Delete</button></td>
        </tr>`;
    });
    table += `</table>`;
    historyDiv.innerHTML = table;
}

function save() {
    localStorage.setItem("currentMatch", JSON.stringify(currentMatch));
    localStorage.setItem("history", JSON.stringify(history));
}

const historyDiv = document.getElementById("history");
render();
