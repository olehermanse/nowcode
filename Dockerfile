FROM node:8 AS build
ADD ./ /nowcode
WORKDIR /nowcode
RUN rm -rf web/dist
RUN rm -rf nowcode_server/web
RUN sh -c "cd web && npm install && npm run gulp"
RUN mkdir nowcode_server/web
RUN cp -r web/dist nowcode_server/web

FROM python:3-alpine
COPY --from=build /nowcode /nowcode
WORKDIR /nowcode
RUN pip3 install -r requirements.txt
ENV PORT 80
EXPOSE 80
CMD ["gunicorn", "-b", "0.0.0.0:80", "run:app"]
