#!/usr/bin/env sh

killall python3
cd /root/nowcode/ || exit 1
rm -f nohup.out
git reset --hard HEAD
git checkout master
git reset --hard HEAD
git pull
pip3 install -r requirements.txt
cp /root/nowcode/deploy_nowcode.sh /etc/cron.hourly/deploy_nowcode.sh
chmod 700 /etc/cron.hourly/deploy_nowcode.sh
nohup python3 /root/nowcode/server.py --release --port 80 --ip 0.0.0.0 &
