FROM node:8 AS build
ADD ./ /nowcode
WORKDIR /nowcode
RUN rm -rf frontend/dist
RUN sh -c "cd frontend && npm install && npm run gulp"
