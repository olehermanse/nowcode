default: run-server

run-server:
	python3 server.py

swagger.json: server.py
	python3 server.py --docs > swagger.json

public: swagger.json
	spectacle swagger.json

deploy:
	bash deploy_nowcode.sh

deploy-branch:
	rm -f nohup.out
	echo "Deploying current branch"
	echo "Please note that master branch is automatically redeployed every hour"
	pip3 install -r requirements.txt
	nohup python3 /root/nowcode/server.py --release --port 80 --ip 0.0.0.0 &

docs: public swagger.json
	rm -rf docs
	cp -r public docs
	cp swagger.json docs/

check: docs

.PHONY: run-server default check
