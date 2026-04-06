FROM docker.io/node:24.14.1-alpine3.23@sha256:01743339035a5c3c11a373cd7c83aeab6ed1457b55da6a69e014a95ac4e4700b AS build
WORKDIR /nowcode
RUN apk add bash sed git
COPY package-lock.json package.json ./
RUN npm install --only=prod
COPY .git .git
COPY src src
COPY public public
COPY add_version.sh add_version.sh
COPY tsconfig.json tsconfig.json
COPY vite.config.js vite.config.js
COPY index.html index.html
RUN rm -rf dist
RUN npm run build
RUN bash add_version.sh

FROM docker.io/node:24.14.1-alpine3.23@sha256:01743339035a5c3c11a373cd7c83aeab6ed1457b55da6a69e014a95ac4e4700b AS test
WORKDIR /nowcode
COPY --from=build /nowcode /nowcode
COPY test test
RUN npm install --include=dev
RUN npm run tsc
RUN npm run test

FROM docker.io/denoland/deno:2.7.11@sha256:869e31370dca82b10abefeabe92a2efae44c0d8c70e03776b05ca07ce6b2e062 AS run
WORKDIR /nowcode
COPY --from=build /nowcode/dist/ dist/
COPY src/ src/
COPY --from=test /nowcode/package.json /nowcode/package.json
RUN deno install
CMD [ "deno" , "run", "--allow-net", "--allow-read", "--allow-env", "src/backend/backend.ts"]
