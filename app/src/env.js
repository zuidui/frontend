const loadEnvVariables = () => {
    return fetch('/.env')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load .env file: ${response.statusText}`);
            }
            console.log('Environment variables loaded successfully');
            return response.text();
        })
        .then(text => {
            const envVariables = {};
            text.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    envVariables[key.trim()] = value.trim();
                }
            });
            return envVariables;
        })
        .catch(error => {
            console.error('Error loading environment variables:', error);
        });
};

// Make the function globally accessible
window.loadEnvVariables = loadEnvVariables;
