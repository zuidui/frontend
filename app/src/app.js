document.addEventListener('DOMContentLoaded', async function () {
    const env = await loadEnvVariables();
    const apiGatewayUrl = env.API_GATEWAY_URL;
    console.log(`API Gateway URL loaded: ${apiGatewayUrl}`);

    const createTeamButton = document.getElementById('createTeamButton');
    const backButton = document.getElementById('backButton');
    const teamForm = document.getElementById('teamForm');

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

    teamForm.addEventListener('submit', function(event) {
        console.log('Team form submitted');
        event.preventDefault();
        const teamName = document.getElementById('teamName').value;
        const password = document.getElementById('password').value;
        createTeam(apiGatewayUrl, teamName, password);
    });
});

async function createTeam(apiGatewayUrl, teamName, password) {
    try {
        console.log(`Creating team: ${teamName}`);
        const response = await fetch(`${apiGatewayUrl}/create-team`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ teamName, password }),
        });
        const data = await response.json();
        const formResponse = document.getElementById('formResponse');
        const errorMessage = document.getElementById('error-message');
        if (response.status === 200) {
            formResponse.innerHTML = '<p>Team created successfully!</p>';
            errorMessage.style.display = 'none'; // Ocultar mensaje de error
        } else {
            formResponse.innerHTML = '';
            errorMessage.style.display = 'block'; // Mostrar mensaje de error
            errorMessage.textContent = `Error creating team: ${data.message}`; // Establecer el texto del mensaje de error
        }
    } catch (error) {
        console.error('Error creating team:', error);
        document.getElementById('formResponse').innerHTML = '';
        const errorMessage = document.getElementById('error-message');
        errorMessage.style.display = 'block'; // Mostrar mensaje de error
        errorMessage.textContent = 'Error creating team'; // Establecer el texto del mensaje de error
    }
}


window.createTeam = createTeam;

async function fetchUserData() {
    const userId = document.getElementById('userId').value;
    if (!userId) {
        alert("Please enter a User ID");
        return;
    }

    console.log(`Fetching data for user ID: ${userId}`);

    try {
        const response = await fetch(`${apiGatewayUrl}/users/${userId}`);
        console.log(`Request URL: ${apiGatewayUrl}/users/${userId}`);
        const data = await response.json();
        console.log("Response received:", data);

        const userDataDiv = document.getElementById('userData');
        if (response.status !== 200) {
            console.error("Error response:", data);
            userDataDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        } else {
            userDataDiv.innerHTML = `
                <h2>User Details</h2>
                <p>ID: ${data.id}</p>
                <p>Name: ${data.name}</p>
                <p>Email: ${data.email}</p>
                <p>Password: ${data.password}</p>
            `;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

async function fetchAllUsers() {
    console.log("Fetching all users");

    try {
        const response = await fetch(`${apiGatewayUrl}/users`);
        console.log(`Request URL: ${apiGatewayUrl}/users`);
        const data = await response.json();
        console.log("Response received:", data);

        const allUsersDataDiv = document.getElementById('allUsersData');
        if (response.status !== 200) {
            console.error("Error response:", data);
            allUsersDataDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        } else {
            allUsersDataDiv.innerHTML = '<h2>All Users</h2>';
            data.forEach(user => {
                allUsersDataDiv.innerHTML += `
                    <p>ID: ${user.id}</p>
                    <p>Name: ${user.name}</p>
                    <p>Email: ${user.email}</p>
                    <p>Password: ${user.password}</p>
                    <hr>
                `;
            });
        }
    } catch (error) {
        console.error("Error fetching all users data:", error);
    }
}

window.fetchUserData = fetchUserData;
window.fetchAllUsers = fetchAllUsers;
