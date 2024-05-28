async function fetchUserData() {
    const userId = document.getElementById('userId').value;
    if (!userId) {
        alert("Please enter a User ID");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8081/api/v1/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                query {
                    resolve_user(id: ${userId}) {
                        id
                        name
                        email
                        password
                    }
                }
                `
            })
        });

        const data = await response.json();
        const userDataDiv = document.getElementById('userData');
        if (data.errors) {
            userDataDiv.innerHTML = `<pre>${JSON.stringify(data.errors, null, 2)}</pre>`;
        } else {
            userDataDiv.innerHTML = `
                <h2>User Details</h2>
                <p>ID: ${data.data.resolve_user.id}</p>
                <p>Name: ${data.data.resolve_user.name}</p>
                <p>Email: ${data.data.resolve_user.email}</p>
                <p>Password: ${data.data.resolve_user.password}</p>
            `;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}
