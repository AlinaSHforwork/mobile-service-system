FROM node:20.9.0-alpine

# Working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy code files
COPY . .

# Start the application
CMD ["npm", "start"]
