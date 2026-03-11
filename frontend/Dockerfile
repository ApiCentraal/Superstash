FROM node:20-alpine

WORKDIR /app

# Kopieer package files
COPY package*.json ./

# Installeer dependencies
RUN npm install

# Kopieer rest van de code
COPY . .

# Expose port
EXPOSE 3000

# Start command (wordt overschreven door docker-compose voor development)
CMD ["npm", "run", "dev"]
