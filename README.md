# Crickete_match_control_system-
Cricket Match System is a browser-based tool to manage live cricket scores. It tracks runs, wickets, balls, overs, dot balls, and extras like wides. Users can select the batting team, start/end matches, and view a history table of completed matches. Data is saved locally with a modern, responsive UI.

# Cricket Match System 🏏

A **simple, browser-based cricket match management system** built with **HTML, CSS, and JavaScript**.  
This system is designed for **live scoring in cricket matches**, tracking runs, wickets, overs, and maintaining match history.

---

## Features

### 1. Team Setup
- Input fields to add **Team A** and **Team B** names.
- Dropdown to select **batting team** before starting the match.

### 2. Score Management
- Buttons for adding runs:
  - `Dot` → 0 runs, counts as a legal ball.
  - `+1, +2, +4, +6` → normal runs, ball counts.
- **Extra runs**:
  - `Wide` → +1 run, ball **does not count**.
- **Wicket** button → adds wicket, ball counts.
- Automatic **ball & over calculation**:
  - Overs shown in `X.Y` format (X = completed overs, Y = balls in current over).

### 3. Match Control
- **Start Match** → initializes the match with selected batting team.
- **End Match** → completes the match and saves data to history:
  - Calculates **target** for opponent team.
- **Reset** → resets the current match without affecting history.

### 4. Match History
- All completed matches are saved in **localStorage**.
- Displayed in a **table** format:
  - Columns: Batting Team, Runs/Wickets, Overs, Opponent, Target, Action.
- Option to **delete any match** from history.
- Persists across browser sessions.

### 5. User Interface (UI)
- **Light Mode** design with modern styling:
  - White container background, subtle shadows, soft text colors.
  - Buttons color-coded:
    - Blue → Extra runs
    - Green → Normal actions
    - Red → Wicket/Delete
- Responsive layout for **mobile and desktop**.

---

## Usage

1. Open the HTML file in a **modern browser**.
2. Enter team names in the input fields.
3. Select batting team from dropdown.
4. Click **Start Match**.
5. Use buttons to update runs, extras, wickets, and dot balls.
6. Check overs and score at the top.
7. Click **End Match** to finish the match and save it to history.
8. History table shows all matches with **target for opponent team**.
9. Delete any match from history with the **Delete** button.

---

## Technical Details

- **Frontend**: HTML, CSS, JavaScript
- **Data Storage**: `localStorage` (persists match and history)
- **Logic**:
  - Runs, wickets, balls, overs tracked live.
  - Dot balls, wide balls, and wickets handled correctly.
  - Target for opponent calculated as `runs + 1`.

---

## Notes

- Dot balls are tracked without increasing runs but increment balls.
- Wide balls increase runs but do **not** count as a legal ball.
- All data is **saved locally** in the browser and will remain until cleared.
- Modern UI ensures **readability and usability** on match day.

---

## Future Improvements

- Dark/Light mode toggle.
- Undo last action button.
- Export history to CSV for offline record.
- Timer or match clock integration.
- Player-level scorecard per match.

---

## Author

Rakib – A web enthusiast building unique tools for cricket match scoring.
