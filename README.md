# Zuidui frontend

![GitHub release (latest by date)](https://img.shields.io/github/v/release/zuidui/frontend)
![Docker Hub Image Version (latest by date)](https://img.shields.io/docker/v/zuidui/frontend?label=docker%20hub)
![GitHub](https://img.shields.io/github/license/zuidui/frontend)


## Overview

This is the frontend part of the Zuidui project. It is a simple nginx server that serves the static files of the frontend together with the API requests. The API requests are proxied to the backend server and all services are interconnected within a Docker network named `zuidui`.

## Prerequisites

Ensure you have the following installed on your system:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Project Structure

- `app/`
  - `docker-compose.yml`: Defines the services, their configurations, and networking.
  - `Dockerfile`: Defines the Docker image for the frontend service.
  - `nginx.conf`: Configuration file for Nginx.
  - `public/`: Contains static HTML files and assets.
    - `src/`: Contains the source code for the application.
    - `.env`: Contains environment variables used by Docker Compose and the services. Depending on the environment, you may need to change the `CONTEXT` value to `local`, `minikube`, or `eks`.
    - `static/`: Contains the static files for the application.
- `Makefile`: Provides a set of commands to automate common tasks.
- `.githbu/workflows/`: Contains the GitHub Actions workflows for CI.

## Project commands

The project uses [Makefiles](https://www.gnu.org/software/make/manual/html_node/Introduction.html) to run the most common tasks:

- `help` : Shows this help.
- `todo`: Shows the TODOs in the code.
- `show-env`: Shows the environment variables.
- `clean`: Cleans the app.
- `build`: Builds the app.
- `run`: Runs the app.
- `publish-image-pre`: Publishes the image to the pre-production registry.
- `publish-image-pro`: Publishes the image to the production registry.

### Services

- **Frontend Application**: Accessible at `http://localhost:${APP_PORT}`

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

## License

This project is licensed under the Apache 2.0 License. See the LICENSE file for details.

## Contact

For any inquiries or issues, please open an issue on the [GitHub repository](https://github.com/zuidui/frontend) or contact any of the maintainers.
