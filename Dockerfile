# FROM: Baseimage starten
FROM node:20-alpine

# LABEL: Metadata
LABEL maintainer="NOVI"

# WORKDIR: Werkmapje in container
WORKDIR /app

# COPY: Bestanden van host naar container
COPY package*.json ./

# RUN: Commando's uitvoeren
RUN npm ci --only=production

# COPY: Meer bestanden
COPY src ./src

# HEALTHCHECK: Health monitoring
HEALTHCHECK --interval=30s CMD ...

# EXPOSE: Port declaratie
EXPOSE 3000

# CMD: Default command
CMD ["node", "src/index.js"]