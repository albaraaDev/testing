# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source files
COPY . .

# Accept VITE_ env vars
ARG VITE_APP_NAME
ARG VITE_APP_VERSION
ARG VITE_APP_API_URL
ARG VITE_APP_MQTT_API
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_APP_TYPE

ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_APP_API_URL=$VITE_APP_API_URL
ENV VITE_APP_MQTT_API=$VITE_APP_MQTT_API
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_APP_TYPE=$VITE_APP_TYPE


# Build the app
RUN npm run build

# Serve stage
FROM node:18-alpine
WORKDIR /app

# Copy built files
COPY --from=build /app/dist /app/dist

# Install static file server
RUN npm install -g serve

EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "80"]
