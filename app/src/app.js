document.addEventListener('DOMContentLoaded', async function () {
    const env = await loadEnvVariables();
    const hostName = env.HOST_NAME;
    const hostPort = env.APP_PORT;
    const apiGatewayUrl = `http://${hostName}:${hostPort}/api/v1`;
    console.log('API Gateway URL:', apiGatewayUrl);

    // Restore view and data on page load
    const currentView = sessionStorage.getItem('currentView');
    const teamId = sessionStorage.getItem('teamId');
    const teamName = sessionStorage.getItem('teamName');

    switch (currentView) {
        case 'create-team-view':
            showCreateTeamView();
            break;
        case 'join-team-view':
            showTeamIdentificationView();
            break            
        case 'identification-view':
            showIdentificationView();
            break;
        case 'create-player-view':
            showCreatePlayerView();
            break;
        case 'identify-player-view':
            showIdentifyPlayerView();
            break;
        case 'dashboard-view':
            const players = JSON.parse(sessionStorage.getItem('players'));
            showDashboardView(players);
            break;
        default:
            showMainView();
            break;
    }

    // Event listeners for buttons and forms
    document.getElementById('createTeamButton').addEventListener('click', showCreateTeamView);
    document.getElementById('joinTeamButton').addEventListener('click', showTeamIdentificationView);
    document.getElementById('createPlayerButton').addEventListener('click', showCreatePlayerView);
    document.getElementById('identifyPlayerButton').addEventListener('click', showIdentifyPlayerView);
    document.getElementById('ratePlayersButton').addEventListener('click', function() {
        document.getElementById('playerTableContainer').style.display = 'block';
    });    
    document.getElementById('backButtonCreateTeam').addEventListener('click', showMainView);
    document.getElementById('backButtonJoinTeam').addEventListener('click', showMainView);
    document.getElementById('backButtonCreatePlayer').addEventListener('click', showIdentificationView);
    document.getElementById('backButtonIdentifyPlayer').addEventListener('click', showMainView);

    document.getElementById('createTeamForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const teamName = document.getElementById('createTeamNameInput').value;
        const teamPassword = document.getElementById('createTeamPasswordInput').value;
        await createTeam(apiGatewayUrl, teamName, teamPassword);
    });

    document.getElementById('joinTeamForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const teamName= document.getElementById('joinTeamNameInput').value;
        const teamPassword = document.getElementById('joinTeamPasswordInput').value;
        await joinTeam(apiGatewayUrl, teamName, teamPassword);
    });

    document.getElementById('createPlayerForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const playerName = document.getElementById('newPlayerNameInput').value;
        const teamId =  sessionStorage.getItem('teamId');
        await createPlayer(apiGatewayUrl, teamId, playerName);
    });

    document.getElementById('identifyPlayerForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const playerName = document.getElementById('existingPlayerNameInput').value;
        const teamId = document.getElementById('teamIdDisplay').textContent;
        await identifyPlayer(apiGatewayUrl, teamId, playerName);
    });

    document.getElementById('ratePlayersForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const teamId = document.getElementById('teamIdDisplay').textContent;
        const players = JSON.parse(sessionStorage.getItem('players'));
        const ratingInputs = document.querySelectorAll('#playerTableBody input');
        const ratings = Array.from(ratingInputs).map(input => parseInt(input.value));
        await ratePlayers(apiGatewayUrl, teamId, players, ratings);
    });

    // Event listeners for table row clicks
    document.getElementById('playerTableBody').addEventListener('click', function (event) {
        const target = event.target;
        if (target.tagName === 'TD' && target.classList.contains('read-only')) {
            target.contentEditable = true;
            target.focus();
        }
    });

    // Event listeners for table row edits
    document.getElementById('playerTableBody').addEventListener('blur', async function (event) {
        const target = event.target;
        if (target.tagName === 'TD' && target.classList.contains('read-only')) {
            target.contentEditable = false;
            const teamId = document.getElementById('teamIdDisplay').textContent;
            const players = JSON.parse(sessionStorage.getItem('players'));
            const playerIndex = Array.from(target.parentElement.parentElement.children).indexOf(target.parentElement);
            const rating = parseFloat(target.textContent);
            players[playerIndex].averageRating = rating;
            await updatePlayerRating(apiGatewayUrl, teamId, players[playerIndex]);
        }
    });



});

// Hide all views initially
function hideAllViews() {
    document.getElementById('main-view').style.display = 'none';
    document.getElementById('create-team-view').style.display = 'none';
    document.getElementById('join-team-view').style.display = 'none';
    document.getElementById('identification-view').style.display = 'none';
    document.getElementById('create-player-view').style.display = 'none';
    document.getElementById('identify-player-view').style.display = 'none';
    document.getElementById('dashboard-view').style.display = 'none';
}

// Show the main view
function showMainView() {
    hideAllViews();
    document.getElementById('main-view').style.display = 'block';
    sessionStorage.setItem('currentView', 'main-view');
}

// Show the create team view
function showCreateTeamView() {
    hideAllViews();
    document.getElementById('create-team-view').style.display = 'block';
    sessionStorage.setItem('currentView', 'create-team-view');
}

// Show the join team view
function showTeamIdentificationView() {
    hideAllViews();
    document.getElementById('join-team-view').style.display = 'block';
    sessionStorage.setItem('currentView', 'join-team-view');
}

// Show the identification view and set team information if provided
function showIdentificationView() {
    hideAllViews();
    document.getElementById('identification-view').style.display = 'block';
    const teamName = sessionStorage.getItem('teamName');
    if (teamName) document.getElementById('identificationTeamNameDisplay').textContent = teamName;
    sessionStorage.setItem('currentView', 'identification-view');
}

// Show the create player view
function showCreatePlayerView() {
    hideAllViews();
    document.getElementById('create-player-view').style.display = 'block';
    const teamName = sessionStorage.getItem('teamName');
    if (teamName) document.getElementById('createPlayerTeamNameDisplay').textContent = teamName;
    sessionStorage.setItem('currentView', 'create-player-view');
}

// Show the identify player view
function showIdentifyPlayerView() {
    hideAllViews();
    document.getElementById('identify-player-view').style.display = 'block';
    sessionStorage.setItem('currentView', 'identify-player-view');
}

// Show the dashboard view
async function showDashboardView(players) {
    hideAllViews();
    document.getElementById('dashboard-view').style.display = 'block';
    sessionStorage.setItem('currentView', 'dashboard-view');
    const teamName = sessionStorage.getItem('teamName');
    document.getElementById('dashboardTeamNameDisplay').textContent = teamName;
    populatePlayerTable(players);
}

// Create a new team
async function createTeam(apiGatewayUrl, teamName, teamPassword) {
    try {
        const data = { team_name: teamName, team_password: teamPassword };
        const response = await fetch(`${apiGatewayUrl}/team/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const responseData = await response.json();
        const errorMessage = document.getElementById('create-team-error-message');
        if (response.ok) {
            errorMessage.style.display = 'none';
            sessionStorage.setItem('teamId', responseData.team_id);
            sessionStorage.setItem('teamName', responseData.team_name);
            showCreatePlayerView();
        } else {
            errorMessage.style.display = 'block';
            errorMessage.textContent = `Error creating team: ${responseData.message || 'Unknown error'}`;
            if (responseData.errors) {
                errorMessage.textContent += `: ${responseData.errors.join(', ')}`;
            }
        }
    } catch (error) {
        console.error('Error creating team:', error);
        document.getElementById('create-team-error-message').style.display = 'block';
        document.getElementById('create-team-error-message').textContent = 'This team name is already taken';
    }
}

// Join a team
async function joinTeam(apiGatewayUrl, teamName, teamPassword) {
    try {
        const data = { team_name: teamName, team_password: teamPassword };
        const response = await fetch(`${apiGatewayUrl}/team/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const responseData = await response.json();
        const errorMessage = document.getElementById('join-team-error-message');
        if (response.ok) {
            errorMessage.style.display = 'none';
            sessionStorage.setItem('teamId', responseData.team_id);
            sessionStorage.setItem('teamName', responseData.team_name);
            showIdentificationView();
        } else {
            errorMessage.style.display = 'block';
            errorMessage.textContent = `Error joining team: ${responseData.message || 'Unknown error'}`;
            if (responseData.errors) {
                errorMessage.textContent += `: ${responseData.errors.join(', ')}`;
            }
        }
    } catch (error) {
        console.error('Error joining team:', error);
        document.getElementById('join-team-error-message').style.display = 'block';
        document.getElementById('join-team-error-message').textContent = 'Team name or password is incorrect';
    }
}

// Create a new player
async function createPlayer(apiGatewayUrl, teamId, playerName) {
    try {
        const data = { player_team_id: teamId, player_name: playerName };
        const response = await fetch(`${apiGatewayUrl}/team/player/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const responseData = await response.json();
        const errorMessage = document.getElementById('create-player-error-message');
        if (response.ok) {
            errorMessage.style.display = 'none';
            // Check this response data
            sessionStorage.setItem('teamId', responseData.player_team_id);
            sessionStorage.setItem('teamName', responseData.team_name);
            sessionStorage.setItem('players', JSON.stringify(responseData.players));
            showDashboardView(responseData.players);
        } else {
            errorMessage.style.display = 'block';
            errorMessage.textContent = `Error creating player: ${responseData.message || 'Unknown error'}`;
            if (responseData.errors) {
                errorMessage.textContent += `: ${responseData.errors.join(', ')}`;
            }        
        }
    } catch (error) {
        console.error('Error creating player:', error);
        document.getElementById('create-player-error-message').style.display = 'block';
        document.getElementById('create-player-error-message').textContent = 'This player name is already part of the team';
   }
}

// Fetch all players for the current team
function populatePlayerTable(players) {
    const playerTableBody = document.getElementById('playerTableBody');
    playerTableBody.innerHTML = '';

    players.forEach(player => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = player.name;
        row.appendChild(nameCell);

        const ratingCell = document.createElement('td');
        ratingCell.textContent = player.averageRating.toFixed(2);
        ratingCell.classList.add('read-only');
        row.appendChild(ratingCell);

        const rateCell = document.createElement('td');
        const rateInput = document.createElement('input');
        rateInput.type = 'number';
        rateInput.min = 1;
        rateInput.max = 5;
        rateCell.appendChild(rateInput);
        row.appendChild(rateCell);

        playerTableBody.appendChild(row);
    });
}