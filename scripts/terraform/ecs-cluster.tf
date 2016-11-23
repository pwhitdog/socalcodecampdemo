provider "aws" {
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
  region = "${var.region}"
}

resource "aws_ecr_repository" "codecampci_ecr" {
  name = "codecampci"
}