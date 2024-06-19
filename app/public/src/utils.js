let envCache = null;

export const loadEnvVariables = async () => {
    if (envCache) {
        return envCache;
    }

    const response = await fetch('/.env');
    if (!response.ok) {
        throw new Error(`Failed to load .env file: ${response.statusText}`);
    }

    const text = await response.text();
    envCache = text.split('\n').reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) {
            acc[key.trim()] = value.trim();
        }
        return acc;
    }, {});

    return envCache;
};

export const getEnvVariable = (key, fallbackValue) => {
    if (!envCache) {
        throw new Error('Environment variables not loaded yet');
    }
    return envCache[key] || fallbackValue;
};

export function getGatewayHost(env) {
    const context = env.CONTEXT || 'local';
    switch (context) {
        case 'eks':
            return env.EKS_GATEWAY_HOST;
        case 'minikube':
            return env.MINIKUBE_GATEWAY_HOST;
        case 'local':
        default:
            return env.LOCAL_GATEWAY_HOST;
    }
}