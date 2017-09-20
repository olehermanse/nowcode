default: run-server

run-server:
	python3 server.py

swagger.json: server.py
	python3 server.py --docs > swagger.json

public: swagger.json
	spectacle swagger.json

docs: public swagger.json
	rm -rf docs
	cp -r public docs
	cp swagger.json docs/

.PHONY: run-server default
