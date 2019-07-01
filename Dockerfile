FROM node:10

WORKDIR /home

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

EXPOSE 8765
CMD ["yarn", "dev"]
