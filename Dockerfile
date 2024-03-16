FROM node:20.11.1 AS build
ADD ./ /nowcode
WORKDIR /nowcode
RUN rm -rf frontend/dist
RUN npm install --only=prod
RUN npm run build
ENV PORT 3000
ENV NODE_ENV production
EXPOSE 3000
CMD ["node", "backend/server.js"]
