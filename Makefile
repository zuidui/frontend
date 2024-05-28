.DEFAULT_GOAL := help

include app/.env

SRC_PATH=./app
export REGISTRY=$(DOCKERHUB_USERNAME)/$(IMAGE_NAME)
export TAGS=$(shell curl -s "https://hub.docker.com/v2/repositories/${REGISTRY}/tags/" | jq -r '.results[].name'| grep -E 'rc[0-9]{2}' | tr '\n' ' ')
export LATEST_TAG := $(if $(TAGS),$(lastword $(sort $(TAGS))),00)
export LATEST_VERSION := $(shell echo "$(LATEST_TAG)" | sed -E 's/([0-9]+\.[0-9]+\.[0-9]+)-rc[0-9]{2}+/\1/')
export LATEST_RC := $(if $(filter-out 00,$(LATEST_TAG)),$(shell echo "$(LATEST_TAG)" | sed -E 's/^.*-rc([0-9]{2})$$/\1/'),00)
ifneq ($(IMAGE_VERSION),$(LATEST_VERSION))
	NEXT_RC := 00
else
	NEXT_RC := $(if $(filter-out 00,$(LATEST_TAG)),$(shell printf "%02d" $$(($(LATEST_RC) + 1))),00)
endif
export NEXT_RC

.PHONY: help
help:  ## Show this help.
	@grep -E '^\S+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "%-30s %s\n", $$1, $$2}'

.PHONY: todo
todo:  ## Show the TODOs in the code.
	@{ grep -n -w TODO Makefile | uniq || echo "No pending tasks"; } | sed '/grep/d'

.PHONY: show-env
show-env:  ## Show the environment variables.
	@echo "Showing the environment variables."
	@echo "REGISTRY: $(REGISTRY)"
	@echo "TAGS: $(TAGS)"
	@echo "LATEST_TAG: $(LATEST_TAG)"
	@echo "IMAGE_VERSION: $(IMAGE_VERSION)"
	@echo "LATEST_VERSION: $(LATEST_VERSION)"
	@echo "LATEST_RC: $(LATEST_RC)"
	@echo "NEXT_RC: $(NEXT_RC)"

.PHONY: clean
clean:  ## Clean the app.
	@echo "Cleaning the docker image."
	docker-compose -f $(SRC_PATH)/docker-compose.yml down

.PHONY: build
build:  ## Build the app.
	@echo "Building $(IMAGE_NAME) docker image as $(IMAGE_NAME):$(IMAGE_VERSION)."
	docker build -t $(REGISTRY):$(IMAGE_VERSION) $(SRC_PATH)

.PHONY: run
run:  ## Start the app in development mode.
	@echo "Starting the app in development mode."
	docker-compose -f $(SRC_PATH)/docker-compose.yml up --build $(IMAGE_NAME)

## TODO: Tag the image in git  - check with GithubActions
.PHONY: publish-image-rc
publish-image-rc: build ## Push the release candidate to the registry.
	@echo "Publishing the image as release candidate -  $(REGISTRY):$(IMAGE_VERSION)-rc$(NEXT_RC)"
	docker tag $(REGISTRY):$(IMAGE_VERSION) $(REGISTRY):$(IMAGE_VERSION)-rc$(NEXT_RC)
	docker push $(REGISTRY):$(IMAGE_VERSION)-rc$(NEXT_RC)

.PHONY: publish-image-latest
publish-image-latest:  build ## Publish the latest release to the registry.
	@echo "Publishing the latest image as latest- $(REGISTRY):$(LATEST_TAG) as latest"
	docker pull $(REGISTRY):$(LATEST_TAG)
	docker tag $(REGISTRY):$(LATEST_TAG) $(REGISTRY):latest
	docker push $(REGISTRY):latest
