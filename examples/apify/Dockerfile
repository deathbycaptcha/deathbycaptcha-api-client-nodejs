FROM apify/actor-node:22
COPY . ./
RUN npm install --omit=dev
CMD [ "npm", "run", "start" ]
