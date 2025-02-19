# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /backend

# Copy package.json and package-lock.json first (to cache dependencies)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend files
COPY . .

# Expose port
EXPOSE 5000

# Start the backend server
CMD ["npm", "start"]
