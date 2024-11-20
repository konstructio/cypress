# Use the Cypress image as the base image
FROM cypress/included:latest

# Set the working directory
WORKDIR /tests

# Copy necessary files into the container
COPY ./package.json .
COPY ./cypress.config.ts .
COPY ./cypress ./cypress
COPY ./checkStatus.js .
COPY ./tsconfig.json .
COPY ./git-clone.sh .
COPY ./git-status.js .

# Install dependencies
RUN npm install

# Install additional packages (like github-cli) if needed
# Note: Ensure apk packages are installed in the right context
RUN apt-get update
RUN apt install gh

# Check node and npm versions for debugging
RUN node -v && npm -v

# Define the entrypoint for running Cypress tests
ENTRYPOINT ["npx", "cypress", "run"]

