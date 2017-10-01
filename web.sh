#!/usr/bin/env bash

set -e

apt install npm
apt install node
cd /root/nowcode/web/
npm install
gulp
