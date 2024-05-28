.DEFAULT_GOAL := help

include app/.env

SRC_PATH=./app
export REGISTRY_PRE=$(DOCKERHUB_USERNAME)/$(IMAGE_NAME)-dev
export REGISTRY_PRO=$(DOCKERHUB_USERNAME)/$(IMAGE_NAME)
export TAGS=$(shell curl -s "https://hub.docker.com/v2/repositories/${REGISTRY_PRE}/tags/" | jq -r '.results[].name'| grep -E 'rc[0-9]{2}' | tr '\n' ' ')
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
	@echo "REGISTRY_PRE: $(REGISTRY_PRE)"
	@echo "REGISTRY_PRO: $(REGISTRY_PRO)"
	@echo "TAGS: $(TAGS)"
	@echo "LATEST_TAG: $(LATEST_TAG)"
	@echo "IMAGE_VERSION: $(IMAGE_VERSION)"
	@echo "LATEST_VERSION: $(LATEST_VERSION)"
	@echo "LATEST_RC: $(LATEST_RC)"
	@echo "NEXT_RC: $(NEXT_RC)"

.PHONY: clean
clean:  ## Clean the app.
	@echo "Cleaning the docker image."
	@docker-compose -f $(SRC_PATH)/docker-compose.yml down

.PHONY: build
build:  ## Build the app.
	@echo "Building $(IMAGE_NAME) docker image as $(IMAGE_NAME):$(IMAGE_VERSION)."
	@docker build -t $(REGISTRY_PRE):$(IMAGE_VERSION) $(SRC_PATH)

.PHONY: run
run:  ## Start the app in development mode.
	@echo "Starting the app in development mode."
	@docker-compose -f $(SRC_PATH)/docker-compose.yml up --build $(IMAGE_NAME)

.PHONY: publish-image-pre
publish-image-pre: build ## Push the release candidate to the registry.
	@echo "Publishing the image as release candidate -  $(REGISTRY_PRE):$(IMAGE_VERSION)-rc$(NEXT_RC)"
	@docker tag $(REGISTRY_PRE):$(IMAGE_VERSION) $(REGISTRY_PRE):$(IMAGE_VERSION)-rc$(NEXT_RC)
	@docker push $(REGISTRY_PRE):$(IMAGE_VERSION)-rc$(NEXT_RC)
	@git tag -a $(IMAGE_VERSION)-rc$(NEXT_RC) -m "Release candidate $(IMAGE_VERSION)-rc$(NEXT_RC)"
	@git push origin $(IMAGE_VERSION)-rc$(NEXT_RC)

.PHONY: publish-image-pro
publish-image-pro:  ## Publish the latest release to the registry.
	@echo "Publishing the latest image in the registry - $(REGISTRY_PRO):$(LATEST_VERSION)"
	@docker pull $(REGISTRY_PRE):$(LATEST_TAG)
	@docker tag $(REGISTRY_PRE):$(LATEST_TAG) $(REGISTRY_PRO):latest
	@docker tag $(REGISTRY_PRE):$(LATEST_TAG) $(REGISTRY_PRO):$(LATEST_VERSION)
	@docker push $(REGISTRY_PRO):$(LATEST_VERSION)
	@docker push $(REGISTRY_PRO):latest
	@git tag -a $(LATEST_VERSION) -m "Release $(LATEST_VERSION)"
	@git push origin $(LATEST_VERSION)
	@gh release create $(LATEST_VERSION) -t $(LATEST_VERSION) -n $(LATEST_VERSION)

