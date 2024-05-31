export const loadEnvVariables = () => {
    return fetch('/.env')
        .then(response => response.text())
        .then(text => {
            const envVariables = {};
            text.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    envVariables[key.trim()] = value.trim();
                }
            });
            return envVariables;
        });
};
