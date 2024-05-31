import { loadEnvVariables } from './env.js';

let apiGatewayUrl = '';

loadEnvVariables().then(env => {
    apiGatewayUrl = env.API_GATEWAY_URL;
    console.log(`API Gateway URL loaded: ${apiGatewayUrl}`);
}).catch(error => {
    console.error("Error loading environment variables:", error);
});

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
