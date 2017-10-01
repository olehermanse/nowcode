default: run-server

run-server:
	python3 server.py

swagger.json: server.py
	python3 server.py --docs > swagger.json

public: swagger.json
	spectacle swagger.json

deploy:
	rm -f nohup.out
	bash scripts/deploy_nowcode.sh

deploy-branch:
	rm -f nohup.out
	bash scripts/deploy_branch.sh

docs: public swagger.json
	rm -rf docs
	cp -r public docs
	cp swagger.json docs/

check: docs

.PHONY: run-server default check
