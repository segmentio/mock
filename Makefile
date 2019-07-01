VERSION = v0.0.1

run: build
	@docker run -p 8765:8765 -it segment/mock:latest

build:
	@docker build \
		-t segment/mock:$(VERSION) \
		-t segment/mock:latest \
		.

push:
	@docker push segment/mock:$(VERSION)
	@docker push segment/mock:latest
