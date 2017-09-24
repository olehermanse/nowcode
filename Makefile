default: run-server

run-server:
	python3 server.py

swagger.json: server.py
	python3 server.py --docs > swagger.json

public: swagger.json
	spectacle swagger.json

deploy:
	nohup python3 /root/nowcode/server.py --release --port 80 --ip 0.0.0.0 &

docs: public swagger.json
	rm -rf docs
	cp -r public docs
	cp swagger.json docs/

check: docs

.PHONY: run-server default check
