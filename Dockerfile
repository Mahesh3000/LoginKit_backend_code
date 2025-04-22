# Use official Node.js image as base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire backend source code into the container
COPY . .

# Expose the backend port
EXPOSE 8000

# Command to run the backend
CMD ["npm", "start"]
