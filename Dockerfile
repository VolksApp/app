# Stage 1: Build React app with Vite
FROM node:18 AS build
WORKDIR /app
COPY src/package*.json ./
RUN npm install
COPY src/ .
RUN npm run build  # Outputs to /app/dist (Vite default)

# Stage 2: Serve static files with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]