# 1) Build frontend (Vite/React)
FROM node:20 AS frontend-build

WORKDIR /app/src/frontend

# Copy only frontend package files first (for better caching)
COPY src/frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend source and build
COPY src/frontend ./
RUN npm run build

# 2) Build backend (Express + SQLite)
FROM node:20 AS backend-build

WORKDIR /app/src/backend

# Copy backend package files and install deps (inside container)
COPY src/backend/package*.json ./
RUN npm install

# Ensure native modules (like sqlite3) are built for this image
RUN npm rebuild sqlite3 --build-from-source

# Copy backend source and db
COPY src/backend ./
COPY src/db /app/src/db

# Copy built frontend into backend public folder
COPY --from=frontend-build /app/src/frontend/dist ./public

# 3) Run backend server
WORKDIR /app/src/backend

EXPOSE 8080

CMD ["node", "server.js"]