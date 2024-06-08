document.addEventListener('DOMContentLoaded', async function () {
    const env = await loadEnvVariables();
    const apiGatewayUrl = env.API_GATEWAY_URL;
    console.log(`API Gateway URL loaded: ${apiGatewayUrl}`);

    const createTeamButton = document.getElementById('createTeamButton');
    const backButton = document.getElementById('backButton');
    const teamForm = document.getElementById('teamForm');

    const backButtonCreatePlayer = document.getElementById('backButtonCreatePlayer');
    const createPlayerButton = document.getElementById('createPlayerButton');
    const createPlayerForm = document.getElementById('createPlayerForm');

    const backButtonIdentifyPlayer = document.getElementById('backButtonIdentifyPlayer');
    const identifyPlayerButton = document.getElementById('identifyPlayerButton');
    const identifyPlayerForm = document.getElementById('identifyPlayerForm');

    createTeamButton.addEventListener('click', function() {
        console.log('Create team button clicked');
        document.getElementById('main-view').style.display = 'none';
        document.getElementById('create-team-view').style.display = 'block';
    });

    backButton.addEventListener('click', function() {
        console.log('Back button clicked');
        document.getElementById('create-team-view').style.display = 'none';
        document.getElementById('main-view').style.display = 'block';
    });

    backButtonCreatePlayer.addEventListener('click', function() {
        console.log('Back button clicked');
        document.getElementById('create-player-view').style.display = 'none';
        document.getElementById('identification-view').style.display = 'block';
    });

    backButtonIdentifyPlayer.addEventListener('click', function() {
        console.log('Back button clicked');
        document.getElementById('identify-player-view').style.display = 'none';
        document.getElementById('identification-view').style.display = 'block';
    });

    createPlayerButton.addEventListener('click', function() {
        console.log('Create player button clicked');
        document.getElementById('identification-view').style.display = 'none';
        document.getElementById('create-player-view').style.display = 'block';
    });

    identifyPlayerButton.addEventListener('click', function() {
        console.log('Identify player button clicked');
        document.getElementById('identification-view').style.display = 'none';
        document.getElementById('identify-player-view').style.display = 'block';
    });

    teamForm.addEventListener('submit', function(event) {
        console.log('Team form submitted');
        event.preventDefault();
        const teamName = document.getElementById('teamName').value;
        const teamPassword = document.getElementById('teamPassword').value;
        createTeam(apiGatewayUrl, teamName, teamPassword);
    });

    createPlayerForm.addEventListener('submit', function(event) {
        console.log('Create player form submitted');
        event.preventDefault();
        const playerName = document.getElementById('newPlayerName').value;
        const teamId = document.getElementById('teamId').textContent;
        createPlayer(apiGatewayUrl, teamId, playerName);
    });

    identifyPlayerForm.addEventListener('submit', function(event) {
        console.log('Identify player form submitted');
        event.preventDefault();
        const playerName = document.getElementById('existingPlayerName').value;
        const teamId = document.getElementById('teamId').textContent;
        identifyPlayer(apiGatewayUrl, teamId, playerName);
    });
});

async function createTeam(apiGatewayUrl, teamName, teamPassword) {
    try {
        const data = {team_name: teamName, team_password: teamPassword};
        console.log(`Sending data to API Gateway URL: ${apiGatewayUrl}/team/create with data:`, data);
        const response = await fetch(`${apiGatewayUrl}/team/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        const responseData = await response.json();
        const formResponse = document.getElementById('formResponse');
        const errorMessage = document.getElementById('error-message');
        if (response.status === 200) {
            formResponse.innerHTML = '<p>Team created successfully!</p>';
            errorMessage.style.display = 'none'; // Ocultar mensaje de error
            showIdentificationView(responseData.team_id, responseData.team_name);
        } else {
            formResponse.innerHTML = '';
            errorMessage.style.display = 'block'; // Mostrar mensaje de error
            errorMessage.textContent = `Error creating team: ${responseData.message}`; // Establecer el texto del mensaje de error
        }
    } catch (error) {
        console.error('Error creating team:', error);
        document.getElementById('formResponse').innerHTML = '';
        const errorMessage = document.getElementById('error-message');
        errorMessage.style.display = 'block'; // Mostrar mensaje de error
        errorMessage.textContent = 'Error creating team'; // Establecer el texto del mensaje de error
    }
}

async function createPlayer(apiGatewayUrl, teamId, playerName) {
    try {
        console.log(`Creating player: ${playerName} for team: ${teamId}`);
        const response = await fetch(`${apiGatewayUrl}/team/player/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ teamId, playerName }),
        });
        const data = await response.json();
        const formResponse = document.getElementById('formResponseCreatePlayer');
        const errorMessage = document.getElementById('error-message-create-player');
        if (response.status === 200) {
            formResponse.innerHTML = '<p>Player created successfully!</p>';
            errorMessage.style.display = 'none'; // Hide error message
            showDashboardView(apiGatewayUrl, data.teamName, data.playerName, data.playerScore);
        } else {
            formResponse.innerHTML = '';
            errorMessage.style.display = 'block'; // Show error message
            errorMessage.textContent = `Error creating player: ${data.message}`; // Set error message text
        }
    } catch (error) {
        console.error('Error creating player:', error);
        document.getElementById('formResponseCreatePlayer').innerHTML = '';
        const errorMessage = document.getElementById('error-message-create-player');
        errorMessage.style.display = 'block'; // Show error message
        errorMessage.textContent = 'Error creating player'; // Set error message text
    }
}

async function identifyPlayer(apiGatewayUrl, teamId, playerName) {
    try {
        console.log(`Identifying player: ${playerName} for team: ${teamId}`);
        const response = await fetch(`${apiGatewayUrl}/team/player/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ teamId, playerName }),
        });
        const data = await response.json();
        const formResponse = document.getElementById('formResponseIdentifyPlayer');
        const errorMessage = document.getElementById('error-message-identify-player');
        if (response.status === 200) {
            formResponse.innerHTML = '<p>Player identified successfully!</p>';
            errorMessage.style.display = 'none'; // Hide error message
            showDashboardView(apiGatewayUrl, data.teamName, data.playerName, data.playerScore);
        } else {
            formResponse.innerHTML = '';
            errorMessage.style.display = 'block'; // Show error message
            errorMessage.textContent = `Error identifying player: ${data.message}`; // Set error message text
        }
    } catch (error) {
        console.error('Error identifying player:', error);
        document.getElementById('formResponseIdentifyPlayer').innerHTML = '';
        const errorMessage = document.getElementById('error-message-identify-player');
        errorMessage.style.display = 'block'; // Show error message
        errorMessage.textContent = 'Error identifying player'; // Set error message text
    }
}

function showIdentificationView(teamId, teamName) {
    document.getElementById('main-view').style.display = 'none';
    document.getElementById('create-team-view').style.display = 'none';
    document.getElementById('identification-view').style.display = 'block';
    document.getElementById('teamId').textContent = teamId;
    document.getElementById('teamName').textContent = teamName;
}

async function showDashboardView(apiGatewayUrl, teamId, playerName) {
    try {
        console.log(`Fetching team data for dashboard: ${teamId}`);
        const response = await fetch(`${apiGatewayUrl}/team/${teamId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        if (response.status === 200) {
            document.getElementById('identification-view').style.display = 'none';
            document.getElementById('dashboard-view').style.display = 'block';
            document.getElementById('dashboardTeamName').textContent = data.teamName;

            const playersList = document.getElementById('playersList');
            playersList.innerHTML = '';
            data.players.forEach(player => {
                const playerItem = document.createElement('div');
                playerItem.className = 'player-item';
                playerItem.innerHTML = `
                    <p>Player Name: ${player.name} - Score: ${player.score}</p>
                    <label for="score-${player.id}">New Score:</label>
                    <input type="number" id="score-${player.id}" name="score-${player.id}" min="0" max="100">
                `;
                playersList.appendChild(playerItem);
            });

            const createMatchButton = document.getElementById('createMatchButton');
            const ratePlayersButton = document.getElementById('ratePlayersButton');

            createMatchButton.addEventListener('click', function() {
                // Implement create match functionality
                console.log('Create match button clicked');
            });

            ratePlayersButton.addEventListener('click', function() {
                // Implement rate players functionality
                console.log('Rate players button clicked');
            });
        } else {
            console.error('Error fetching team data for dashboard:', data.message);
        }
    } catch (error) {
        console.error('Error fetching team data for dashboard:', error);
    }
}


window.createTeam = createTeam;
window.createPlayer = createPlayer;
window.identifyPlayer = identifyPlayer;