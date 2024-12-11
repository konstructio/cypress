# Use the Cypress image as the base image
FROM cypress/included:13.16.1

# Set the working directory
WORKDIR /tests

# Copy necessary files into the container
COPY ./package.json .
COPY ./cypress.config.ts .
COPY ./cypress ./cypress
COPY ./tsconfig.json .

# Install dependencies
RUN npm install

# Define the entrypoint for running Cypress tests
ENTRYPOINT ["npm", "run", "cy:run"]

