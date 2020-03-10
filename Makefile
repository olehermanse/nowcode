web/dist: web/src/*
	sh -c "cd web && npm install"
	sh -c "cd web && npm run gulp"
	rm -rf nowcode_server/web
	mkdir nowcode_server/web
	cp -r web/dist nowcode_server/web

nowcode.tar:
	rm -f nowcode.tar ; tar -c -f nowcode.tar ./*

.PHONY: default nowcode.tar
