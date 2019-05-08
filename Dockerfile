FROM ubuntu:latest
ADD ./ /nowcode
WORKDIR /nowcode
RUN apt-get update && apt-get install -y --no-install-recommends apt-utils
RUN apt-get install -y curl nodejs npm make
RUN npm --version
RUN make web/dist
RUN apt-get install -y python3 python3-pip python3-dev
RUN pip3 install -r requirements.txt
ENV NODE_ENV production
ENV PORT 80
EXPOSE 80
CMD ["python3", "nowcode_server", "--release", "--port", "80", "--ip", "0.0.0.0"]
