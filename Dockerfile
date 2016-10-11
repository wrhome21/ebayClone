FROM node:latest

# Create upay directory
RUN mkdir -p /usr/src/upay
WORKDIR /usr/src/upay

# Install upay dependencies
COPY package.json /usr/src/upay/
RUN npm install

# Bundle upay source
COPY . /usr/src/upay

EXPOSE 8080

CMD [ "node", "app.js" ]