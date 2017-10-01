#!/usr/bin/env sh

set -e

cd /root/nowcode/
rm -f nohup.out
git reset --hard HEAD
git checkout master
git reset --hard HEAD
git pull
pip3 install -r requirements.txt

bash /root/nowcode/scripts/deploy_branch.sh
