#!/usr/bin/env sh

killall python3
cd /root/nowcode/ || exit 1
git reset --hard HEAD
git checkout master
git pull
cp /root/nowcode/nowcode.sh /etc/cron.hourly/nowcode.sh
chmod 700 /etc/cron.hourly/nowcode.sh
nohup python3 /root/nowcode/server.py --release --port 80 --ip 0.0.0.0 &
