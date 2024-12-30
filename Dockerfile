# Use the Cypress image as the base image
FROM cypress/included:13.17.0

# Set the working directory
WORKDIR /tests

RUN apt-get update
RUN apt install gh

# Copy necessary files into the container
COPY ./package.json .
COPY ./cypress.config.ts .
COPY ./cypress ./cypress
COPY ./tsconfig.json .

# Install dependencies
RUN npm install
RUN find ./cypress -type f -name "*.sh" -exec chmod +x {} \;

# Define the entrypoint for running Cypress tests
ENTRYPOINT ["npx", "cypress", "run"]

