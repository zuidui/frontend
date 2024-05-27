async function fetchUserData() {
    const userId = document.getElementById('userId').value;
    if (!userId) {
        alert("Please enter a User ID");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8000/users/${userId}`);
        const data = await response.json();

        const userDataDiv = document.getElementById('userData');
        userDataDiv.innerHTML = `
            <h2>User Details</h2>
            <p>ID: ${data.id}</p>
            <p>Name: ${data.name}</p>
            <p>Email: ${data.email}</p>
        `;
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}
