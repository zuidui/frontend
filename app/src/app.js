document.addEventListener('DOMContentLoaded', async function () {
    const env = await loadEnvVariables();
    const hostName = env.HOST_NAME || 'localhost';
    const hostPort = env.APP_PORT;
    const apiGatewayUrl = `http://${hostName}:${hostPort}/api/v1`;
    console.log('API Gateway URL:', apiGatewayUrl);

    // Check if it's the first load after starting the Docker container
    if (!sessionStorage.getItem('isInitialized')) {
        sessionStorage.clear(); // Clear all previous state
        sessionStorage.setItem('isInitialized', 'true'); // Set initialization flag
        showMainView(); // Show main view by default
    } else {
        // Restore view and data on page load
        const currentView = sessionStorage.getItem('currentView');
        const teamId = sessionStorage.getItem('teamId');
        const teamName = sessionStorage.getItem('teamName');

        switch (currentView) {
            case 'create-team-view':
                showCreateTeamView();
                break;
            case 'identification-view':
                showIdentificationView(teamId, teamName);
                break;
            case 'create-player-view':
                showCreatePlayerView();
                break;
            case 'identify-player-view':
                showIdentifyPlayerView();
                break;
            case 'dashboard-view':
                showDashboardView();
                break;
            default:
                showMainView();
                break;
        }
    }

    // Event listeners for buttons and forms
    document.getElementById('createTeamButton').addEventListener('click', showCreateTeamView);
    document.getElementById('backButton').addEventListener('click', showMainView);
    document.getElementById('backButtonCreatePlayer').addEventListener('click', showIdentificationView);
    document.getElementById('backButtonIdentifyPlayer').addEventListener('click', showIdentificationView);
    document.getElementById('createPlayerButton').addEventListener('click', showCreatePlayerView);
    document.getElementById('identifyPlayerButton').addEventListener('click', showIdentifyPlayerView);

    document.getElementById('teamForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const teamName = document.getElementById('teamNameInput').value;
        const teamPassword = document.getElementById('teamPasswordInput').value;
        await createTeam(apiGatewayUrl, teamName, teamPassword);
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
});

// Hide all views initially
function hideAllViews() {
    document.getElementById('main-view').style.display = 'none';
    document.getElementById('create-team-view').style.display = 'none';
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

// Show the identification view and set team information if provided
function showIdentificationView(teamId = '', teamName = '') {
    hideAllViews();
    document.getElementById('identification-view').style.display = 'block';
    if (teamName) document.getElementById('teamNameDisplay').textContent = teamName;
    sessionStorage.setItem('currentView', 'identification-view');
    sessionStorage.setItem('teamId', teamId);
    sessionStorage.setItem('teamName', teamName);
}

// Show the create player view
function showCreatePlayerView() {
    hideAllViews();
    document.getElementById('create-player-view').style.display = 'block';
    sessionStorage.setItem('currentView', 'create-player-view');
}

// Show the identify player view
function showIdentifyPlayerView() {
    hideAllViews();
    document.getElementById('identify-player-view').style.display = 'block';
    sessionStorage.setItem('currentView', 'identify-player-view');
}

// Show the dashboard view
async function showDashboardView(apiGatewayUrl, teamId, teamName, playerName, playerScore) {
    hideAllViews();
    document.getElementById('dashboard-view').style.display = 'block';
    sessionStorage.setItem('currentView', 'dashboard-view');
   if (teamName) document.getElementById('teamNameDisplay').textContent = teamName;
    if (playerName) document.getElementById('playerNameDisplay').textContent = playerName;
    if (playerScore) document.getElementById('playerScoreDisplay').textContent = playerScore;
    sessionStorage.setItem('teamId', teamId);
    sessionStorage.setItem('teamName', teamName);
    sessionStorage.setItem('playerName', playerName);
    sessionStorage.setItem('playerScore', playerScore);
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
        const formResponse = document.getElementById('formResponse');
        const errorMessage = document.getElementById('error-message');
        if (response.ok) {
            formResponse.innerHTML = '<p>Team created successfully!</p>';
            errorMessage.style.display = 'none';
            showIdentificationView(responseData.team_id, responseData.team_name);
        } else {
            formResponse.innerHTML = '';
            errorMessage.style.display = 'block';
            errorMessage.textContent = `Error creating team: ${responseData.message || 'Unknown error'}`;
            if (responseData.errors) {
                errorMessage.textContent += `: ${responseData.errors.join(', ')}`;
            }
        }
    } catch (error) {
        console.error('Error creating team:', error);
        document.getElementById('formResponse').innerHTML = '';
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('error-message').textContent = 'Error creating team';
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
        const formResponse = document.getElementById('formResponse');
        const errorMessage = document.getElementById('error-message');
        if (response.ok) {
            formResponse.innerHTML = '<p>Player created successfully!</p>';
            errorMessage.style.display = 'none';
            showDashboardView(apiGatewayUrl, responseData.teamName, responseData.playerName, responseData.playerScore);
        } else {
            formResponse.innerHTML = '';
            errorMessage.style.display = 'block';
            errorMessage.textContent = `Error creating player: ${responseData.message || 'Unknown error'}`;
            if (responseData.errors) {
                errorMessage.textContent += `: ${responseData.errors.join(', ')}`;
            }        
        }
    } catch (error) {
        console.error('Error creating player:', error);
        document.getElementById('formResponse').innerHTML = '';
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('error-message').textContent = 'Error creating player';
   }
}

// Identify an existing player
async function identifyPlayer(apiGatewayUrl, teamId, playerName) {
    try {
        const data = { teamId, playerName };
        const response = await fetch(`${apiGatewayUrl}/team/player/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const responseData = await response.json();
        const formResponse = document.getElementById('formResponseIdentifyPlayer');
        const errorMessage = document.getElementById('error-message-identify-player');
        if (response.status === 200) {
            formResponse.innerHTML = '<p>Player identified successfully!</p>';
            errorMessage.style.display = 'none';
            showDashboardView(apiGatewayUrl, responseData.teamId, responseData.playerName);
        } else {
            formResponse.innerHTML = '';
            errorMessage.style.display = 'block';
            errorMessage.textContent = `Error identifying player: ${responseData.message}`;
        }
    } catch (error) {
        console.error('Error identifying player:', error);
        document.getElementById('formResponseIdentifyPlayer').innerHTML = '';
        document.getElementById('error-message-identify-player').style.display = 'block';
        document.getElementById('error-message-identify-player').textContent = 'Error identifying player';
    }
}
