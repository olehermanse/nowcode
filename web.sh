#!/usr/bin/env bash

set -e

apt install -y npm
apt install -y nodejs
cd /root/nowcode/web/
npm install
gulp
