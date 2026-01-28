# # Stage 1: Build the React app
# FROM node:20-alpine AS builder
# WORKDIR /app
# # Copy package files
# COPY package*.json ./
# # Install dependencies (including dev dependencies for build)
# RUN npm ci
# # Copy source code
# COPY . .
# # Build arguments for environment variables
# ARG REACT_APP_API_URL=http://localhost/api
# ENV REACT_APP_API_URL=$REACT_APP_API_URL
# # Build the app
# RUN npm run build
# # Debug: List contents to see what was created
# RUN ls -la /app
# # Stage 2: Serve with nginx
# FROM nginx:alpine
# # Copy built assets from builder
# # Vite outputs to 'dist' folder, not 'build'
# COPY --from=builder /app/dist /usr/share/nginx/html

# # Copy nginx configuration for frontend
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# # Expose port
# EXPOSE 80
# # Start nginx
# CMD ["nginx", "-g", "daemon off;"]

# Frontend Build Stage
# FROM node:18-alpine AS builder

# WORKDIR /app

# # Install Chromium and dependencies for Puppeteer
# RUN apk add --no-cache \
#     chromium \
#     nss \
#     freetype \
#     harfbuzz \
#     ca-certificates \
#     ttf-freefont

# # Tell Puppeteer to use installed Chromium
# ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# # Copy package files
# COPY package*.json ./

# # Install dependencies
# # RUN npm ci --legacy-peer-deps
# RUN npm install --legacy-peer-deps


# # Copy source code
# COPY . .

# # Build argument for API URL
# ARG REACT_APP_API_URL
# ENV REACT_APP_API_URL=$REACT_APP_API_URL

# # Build and prerender
# RUN npm run build && node scripts/prerender.mjs

# # Verify prerendering worked
# RUN echo "Checking prerendered files..." && \
#     ls -la /app/dist && \
#     ls -la /app/dist/about || echo "Warning: /about folder not found"

# # Production Stage - Nginx
# FROM nginx:alpine

# # Copy ALL built and pre-rendered files
# COPY --from=builder /app/dist /usr/share/nginx/html

# # Copy nginx configuration
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]
# Stage 1: Build




# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install Chromium and dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    npm

# Tell Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument for Clerk key (optional)
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# Build the app (includes prerendering)
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]