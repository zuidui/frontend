# Base image
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY nginx.conf /etc/nginx/nginx.conf
COPY public /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Command to run nginx
CMD ["nginx", "-g", "daemon off;"]
