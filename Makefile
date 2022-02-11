.PHONY: dev
dev:
	tyarn
	yarn start:dev
	if [ ! -d "/data/www/funplay-wap-view/dist/wap/js/plugins" ]; then  mkdir -p /data/www/funplay-wap-view/dist/wap/js/plugins; fi
	\cp -r -f  /data/www/funplay-wap-view/plugins/ /data/www/funplay-wap-view/dist/wap/js/;
	echo "Make completed."; 

.PHONY: testing
testing:
	cnpm install
	cnpm run testing
	if [ ! -d "/data/www/funplay-wap-view/dist/wap/js/plugins" ]; then  mkdir -p /data/www/funplay-wap-view/dist/wap/js/plugins; fi
	\cp -r -f  /data/www/funplay-wap-view/plugins/ /data/www/funplay-wap-view/dist/wap/js/;
	echo "Make completed.";

.PHONY: build
build:
	cnpm install --production=false
	cnpm run build
	if [ ! -d "/data/www/funplay-wap-view/dist/wap/js/plugins" ]; then  mkdir -p /data/www/funplay-wap-view/dist/wap/js/plugins; fi
	\cp -r -f  /data/www/funplay-wap-view/plugins/ /data/www/funplay-wap-view/dist/wap/js/;
	echo "Make completed.";

.PHONY: preBuild
preBuild:
	cnpm install --production=false
	cnpm run preBuild
	if [ ! -d "/data/www/funplay-wap-view/dist/wap/js/plugins" ]; then  mkdir -p /data/www/funplay-wap-view/dist/wap/js/plugins; fi
	\cp -r -f  /data/www/funplay-wap-view/plugins/ /data/www/funplay-wap-view/dist/wap/js/;
	echo "Make completed.";
