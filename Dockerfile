# Stage 1: Build the application
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine

# Copy the built files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# --- TAMBAHKAN BAGIAN INI ---
# Copy konfigurasi custom Nginx yang baru dibuat
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ubah EXPOSE ke 8080 (agar dokumentasi jelas)
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]