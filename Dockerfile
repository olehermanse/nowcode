FROM node:8 AS build
ADD ./ /nowcode
WORKDIR /nowcode
RUN rm -rf frontend/dist
RUN npm install
RUN sh -c "cd frontend && npm install"
RUN npm run build
ENV PORT 80
ENV NODE_ENV production
EXPOSE 80
CMD ["node", "backend/backend.js"]
