# Base image
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY public /usr/share/nginx/html
COPY src /usr/share/nginx/html/src
COPY .env /usr/share/nginx/html/.env
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Command to run nginx
CMD ["nginx", "-g", "daemon off;"]
