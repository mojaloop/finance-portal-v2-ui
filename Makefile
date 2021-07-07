.PHONY: build run

NAME = settlements-manager-ui

default: build

build:
	docker build -t $(NAME) .
run:
	docker run --rm -p 8080:8080 --name $(NAME) $(NAME) 
