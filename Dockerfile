FROM node:8 AS build
ADD ./ /nowcode
WORKDIR /nowcode
RUN rm -rf web/dist
RUN rm -rf nowcode_server/web
RUN sh -c "cd web && npm install && npm run gulp"
RUN mkdir nowcode_server/web
RUN cp -r web/dist nowcode_server/web
