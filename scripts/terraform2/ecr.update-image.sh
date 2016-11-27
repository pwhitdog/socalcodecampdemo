#!/usr/bin/env bash
terraform output -state=./scripts/terraform2/terraform.tfstate update-image-script | bash