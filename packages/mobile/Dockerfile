FROM node:20-alpine

# Install Expo CLI dependencies
RUN apk add --no-cache \
    git \
    bash

WORKDIR /workspace

# Expose Expo dev server ports
EXPOSE 8081 19000 19001 19002

# Install global tools
RUN npm install -g expo-cli

CMD ["npm", "run", "dev"]
