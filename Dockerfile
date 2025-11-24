# 1. Build frontend
FROM node:20 AS frontend-build

WORKDIR /app/frontend
COPY ./package*.json ./
COPY ./frontend ./frontend
RUN npm install
RUN npm run build

# 2. Build backend
FROM node:20 AS backend-build

WORKDIR /app
COPY ./package*.json ./
COPY ./backend ./backend
COPY ./db ./db
RUN npm install

# Copy frontend build output to backend's public directory
COPY --from=frontend-build /app/frontend/dist ./backend/public

# 3. Run backend (Express)
WORKDIR /app/backend
EXPOSE 8080

CMD ["node", "server.js"]