#!/usr/bin/env sh

set -e

cd /root/nowcode/

cp /root/nowcode/scripts/deploy_nowcode.sh /etc/cron.hourly/deploy_nowcode.sh
chmod 700 /etc/cron.hourly/deploy_nowcode.sh

bash /root/nowcode/scripts/web.sh

killall python3 || echo "Warning: did not find a python3 process to kill"
rm -rf /root/nowcode_live  || echo "Warning: Did not find a previous live folder"
cp -r /root/nowcode/ /root/nowcode_live

nohup python3 /root/nowcode_live/server.py --release --port 80 --ip 0.0.0.0 &
