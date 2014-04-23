build:
	@npm install

clean:
	@rm -rf node_modules

release:
	@make clean
	@make build

.PHONY: build clean release