default: run-server

web/dist: web/src/*
	bash -c "cd web && npm install && npm run gulp"
	rm -rf nowcode_server/web
	mkdir nowcode_server/web
	cp -r web/dist nowcode_server/web

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

nowcode.tar:
	rm -f nowcode.tar ; tar -c -f nowcode.tar ./*

check: docs

.PHONY: run-server default check nowcode.tar
