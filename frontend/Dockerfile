# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /frontend

# Copy package.json and package-lock.json first to cache dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend files
COPY . .

# Expose the frontend port
EXPOSE 3000

# Start the frontend
CMD ["npm", "run", "dev"]
