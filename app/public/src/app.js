import { loadEnvVariables, getGatewayHost } from './utils.js';

document.addEventListener('DOMContentLoaded', async function () {
    try {
        const localEnv = await loadEnvVariables();
        // FIXME: check how to retrieve the API Gateway URL from the environment variables or add conditional logic
        //const apiGatewayUrl = `http://${env.HOST_NAME}:${env.API_GATEWAY_PORT}/api/v1`; // Local testing
        //const apiGatewayUrl = `http://tfm-local/api/v1`; // Minikube
        //const apiGatewayUrl = `http://${env.HOST_NAME}/api/v1`; // EKS
        const apiGatewayHost = getGatewayHost(localEnv);
        const apiGatewayUrl = `http://${apiGatewayHost}/api/v1`;

        console.log('API Gateway URL:', apiGatewayUrl);
        console.log('Environment variables:', localEnv);

        restoreViewOnLoad();
        initializeEventListeners(apiGatewayUrl);
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});

function restoreViewOnLoad() {
    const currentView = sessionStorage.getItem('currentView');
    const viewMapping = {
        'create-team-view': showCreateTeamView,
        'join-team-view': showTeamIdentificationView,
        'identification-view': showIdentificationView,
        'create-player-view': showCreatePlayerView,
        'identify-player-view': showIdentifyPlayerView,
        'dashboard-view': showDashboardView,
        'main-view': showMainView
    };
    (viewMapping[currentView] || showMainView)();
}

function initializeEventListeners(apiGatewayUrl) {
    const eventListeners = [
        { id: 'createTeamButton', event: 'click', handler: showCreateTeamView },
        { id: 'joinTeamButton', event: 'click', handler: showTeamIdentificationView },
        { id: 'createPlayerButton', event: 'click', handler: showCreatePlayerView },
        { id: 'addPlayerButton', event: 'click', handler: showCreatePlayerView },
        { id: 'identifyPlayerButton', event: 'click', handler: showIdentifyPlayerView },
        { id: 'backButtonCreateTeam', event: 'click', handler: showMainView },
        { id: 'backButtonJoinTeam', event: 'click', handler: showMainView },
        { id: 'backButtonCreatePlayer', event: 'click', handler: showIdentificationView },
        { id: 'backButtonIdentifyPlayer', event: 'click', handler: showMainView },
        { id: 'createTeamForm', event: 'submit', handler: createTeamHandler(apiGatewayUrl) },
        { id: 'joinTeamForm', event: 'submit', handler: joinTeamHandler(apiGatewayUrl) },
        { id: 'createPlayerForm', event: 'submit', handler: createPlayerHandler(apiGatewayUrl) },
        { id: 'identifyPlayerForm', event: 'submit', handler: identifyPlayerHandler(apiGatewayUrl) },
        { id: 'ratePlayersForm', event: 'submit', handler: ratePlayersHandler(apiGatewayUrl) },
        { id: 'playerTableBody', event: 'click', handler: tableRowClickHandler },
        { id: 'playerTableBody', event: 'blur', handler: tableRowBlurHandler(apiGatewayUrl) }
    ];

    eventListeners.forEach(({ id, event, handler }) => {
        document.getElementById(id).addEventListener(event, handler);
    });
}
function createTeamHandler(apiGatewayUrl) {
    return async function (event) {
        event.preventDefault();
        const teamName = document.getElementById('createTeamNameInput').value;
        const teamPassword = document.getElementById('createTeamPasswordInput').value;
        await createTeam(apiGatewayUrl, teamName, teamPassword);
    };
}

function joinTeamHandler(apiGatewayUrl) {
    return async function (event) {
        event.preventDefault();
        const teamName = document.getElementById('joinTeamNameInput').value;
        const teamPassword = document.getElementById('joinTeamPasswordInput').value;
        await joinTeam(apiGatewayUrl, teamName, teamPassword);
    };
}

function createPlayerHandler(apiGatewayUrl) {
    return async function (event) {
        event.preventDefault();
        const playerName = document.getElementById('newPlayerNameInput').value;
        const teamName = sessionStorage.getItem('teamName');
        await createPlayer(apiGatewayUrl, teamName, playerName);
    };
}

function identifyPlayerHandler(apiGatewayUrl) {
    return async function (event) {
        event.preventDefault();
        const playerName = document.getElementById('existingPlayerNameInput').value;
        const teamName = sessionStorage.getItem('teamName');
        await identifyPlayer(apiGatewayUrl, teamName, playerName);
    };
}

function ratePlayersHandler(apiGatewayUrl) {
    return async function (event) {
        event.preventDefault();
        const teamName = document.getElementById('dashboardTeamNameDisplay').textContent;
        const players = JSON.parse(sessionStorage.getItem('playersData'));
        const ratings = Array.from(document.querySelectorAll('#playerTableBody input[type="number"]')).map(input => {
            return input.value.trim() !== '' ? parseInt(input.value, 10) : 0;
        });
        const playerRatings = players.map((player, index) => ({
            player_name: player.player_name,
            player_score: ratings[index]
        }));
        await ratePlayers(apiGatewayUrl, teamName, playerRatings);
    };
}

function tableRowClickHandler(event) {
    const target = event.target;
    if (target.tagName === 'TD' && target.classList.contains('read-only')) {
        target.contentEditable = true;
        target.focus();
    }
}

function tableRowBlurHandler(apiGatewayUrl) {
    return async function (event) {
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
    };
}

function hideAllViews() {
    const views = ['main-view', 'create-team-view', 'join-team-view', 'identification-view', 'create-player-view', 'identify-player-view', 'dashboard-view'];
    views.forEach(view => {
        document.getElementById(view).style.display = 'none';
    });
}

function showMainView() {
    hideAllViews();
    document.getElementById('main-view').style.display = 'block';
    sessionStorage.setItem('currentView', 'main-view');
}

function showCreateTeamView() {
    hideAllViews();
    document.getElementById('create-team-view').style.display = 'block';
    sessionStorage.setItem('currentView', 'create-team-view');
}

function showTeamIdentificationView() {
    hideAllViews();
    document.getElementById('join-team-view').style.display = 'block';
    sessionStorage.setItem('currentView', 'join-team-view');
}

function showIdentificationView() {
    hideAllViews();
    document.getElementById('identification-view').style.display = 'block';
    const teamName = sessionStorage.getItem('teamName');
    if (teamName) document.getElementById('identificationTeamNameDisplay').textContent = teamName;
    sessionStorage.setItem('currentView', 'identification-view');
}

function showCreatePlayerView() {
    hideAllViews();
    document.getElementById('create-player-view').style.display = 'block';
    const teamName = sessionStorage.getItem('teamName');
    if (teamName) document.getElementById('createPlayerTeamNameDisplay').textContent = teamName;
    sessionStorage.setItem('currentView', 'create-player-view');
}

function showIdentifyPlayerView() {
    hideAllViews();
    document.getElementById('identify-player-view').style.display = 'block';
    sessionStorage.setItem('currentView', 'identify-player-view');
}

async function showDashboardView() {
    hideAllViews();
    document.getElementById('dashboard-view').style.display = 'block';
    sessionStorage.setItem('currentView', 'dashboard-view');
    const teamName = sessionStorage.getItem('teamName');
    const players = JSON.parse(sessionStorage.getItem('playersData'));
    document.getElementById('dashboardTeamNameDisplay').textContent = teamName;
    populatePlayerTable(players);
    document.getElementById('playerTableContainer').style.display = 'block';
}

async function createTeam(apiGatewayUrl, teamName, teamPassword) {
    try {
        const data = { team_name: teamName, team_password: teamPassword };
        const response = await fetch(`${apiGatewayUrl}/team/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        await handleApiResponse(response, 'create-team-error-message', showCreatePlayerView);
    } catch (error) {
        handleError('create-team-error-message', 'This team name is already taken');
        console.error('Error creating team:', error);
    }
}

async function joinTeam(apiGatewayUrl, teamName, teamPassword) {
    try {
        const data = { team_name: teamName, team_password: teamPassword };
        const response = await fetch(`${apiGatewayUrl}/team/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        await handleApiResponse(response, 'join-team-error-message', showIdentificationView);
    } catch (error) {
        handleError('join-team-error-message', 'Team name or password is incorrect');
        console.error('Error joining team:', error);
    }
}

async function createPlayer(apiGatewayUrl, teamName, playerName) {
    try {
        const data = { team_name: teamName, player_name: playerName };
        const response = await fetch(`${apiGatewayUrl}/team/player/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        await handleApiResponse(response, 'create-player-error-message', showDashboardView);
    } catch (error) {
        handleError('create-player-error-message', 'This player name is already part of the team');
        console.error('Error creating player:', error);
    }
}

async function identifyPlayer(apiGatewayUrl, teamName, playerName) {
    try {
        const data = { team_name: teamName, player_name: playerName };
        const response = await fetch(`${apiGatewayUrl}/player/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        await handleApiResponse(response, 'identify-player-error-message', showDashboardView);
    } catch (error) {
        handleError('identify-player-error-message', 'Player name is incorrect');
        console.error('Error identifying player:', error);
    }
}

async function ratePlayers(apiGatewayUrl, teamName, playersScore) {
    try {
        const data = { team_name: teamName, players_data: playersScore };
        const response = await fetch(`${apiGatewayUrl}/team/rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        await handleApiResponse(response, 'rate-players-error-message', showDashboardView);
    } catch (error) {
        handleError('rate-players-error-message', 'Error rating players');
        console.error('Error rating players:', error);
    }
}

function handleError(elementId, message) {
    const errorMessage = document.getElementById(elementId);
    errorMessage.style.display = 'block';
    errorMessage.textContent = message;
}

async function handleApiResponse(response, errorElementId, successCallback) {
    const responseData = await response.json();
    if (response.ok) {
        document.getElementById(errorElementId).style.display = 'none';
        sessionStorage.setItem('teamName', responseData.team_name);
        sessionStorage.setItem('playersData', JSON.stringify(responseData.players_data));
        successCallback();
    } else {
        handleError(errorElementId, `Error: ${responseData.message || 'Unknown error'}`);
        if (responseData.errors) {
            handleError(errorElementId, `${responseData.message}: ${responseData.errors.join(', ')}`);
        }
    }
}

function populatePlayerTable(players) {
    const playerTableBody = document.getElementById('playerTableBody');
    playerTableBody.innerHTML = '';

    players.forEach(player => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = player.player_name;
        row.appendChild(nameCell);

        const ratingCell = document.createElement('td');
        ratingCell.textContent = player.player_average_rating.toFixed(2);
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