frontend/dist: frontend/src/*
	sh -c "cd frontend && npm install"
	sh -c "cd frontend && npm run gulp"
	rm -rf nowcode_server/frontend
	mkdir nowcode_server/frontend
	cp -r frontend/dist nowcode_server/frontend

nowcode.tar:
	rm -f nowcode.tar ; tar -c -f nowcode.tar ./*

.PHONY: default nowcode.tar
