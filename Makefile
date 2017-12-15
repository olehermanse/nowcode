default: run-server

web/dist: web/src/*
	bash -c "cd web && npm install && gulp"

run-server:
	python3 nowcode_server

swagger.json: nowcode_server
	python3 nowcode_server --docs > swagger.json

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
