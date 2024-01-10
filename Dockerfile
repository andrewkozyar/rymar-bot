FROM node:18.17.0-stretch
WORKDIR '/app'
COPY ./package.json ./
RUN npm install --force
COPY . .
CMD ["npm", "run", "start"]