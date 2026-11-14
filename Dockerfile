FROM docker.io/node:24.22.3-alpine3.24@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5 AS build
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

FROM docker.io/node:24.22.3-alpine3.24@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5 AS test
WORKDIR /nowcode
COPY --from=build /nowcode /nowcode
COPY test test
RUN npm install --include=dev
RUN npm run tsc
RUN npm run test

FROM docker.io/denoland/deno:2.9.8@sha256:a0d88a7fcbd44f062cba2748e19df67d30290ad12aa203c7c1e0b12462c483f0 AS run
WORKDIR /nowcode
COPY --from=build /nowcode/dist/ dist/
COPY src/ src/
COPY --from=test /nowcode/package.json /nowcode/package.json
RUN deno install
CMD [ "deno" , "run", "--allow-net", "--allow-read", "--allow-env", "src/backend/backend.ts"]
