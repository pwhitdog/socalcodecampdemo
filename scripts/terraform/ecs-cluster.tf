provider "aws" {
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
  region = "${var.region}"
}

resource "aws_ecr_repository" "codecampci_ecr" {
  name = "codecampci"
}

resource "aws_ecs_cluster" "codecampci_ecs" {
  name = "codecampci"

}

resource "aws_ecs_service" "codecampci_service" {
  name = "codecampci"
  cluster = "${aws_ecs_cluster.codecampci_ecs.id}"
  task_definition = "arn:aws:ecs:us-west-2:417922976742:task-definition/codecampci:2"
  desired_count = 2
  // iam_role = "arn:aws:iam::417922976742:role/demos-ci"
  // TODO: use this if terraform created the policy so that terraform can destroy them in the right order
  // depends_on = ["aws_iam_role_policy.foo"]

  // TODO: load balancer
  //  load_balancer {
  //    elb_name = "${aws_elb.foo.name}"
  //    container_name = "mongo"
  //    container_port = 8080
  //  }
}

resource "aws_instance" "codecampci_ec2" {
  ami = "ami-7abc111a"
  instance_type = "t2.micro"
  key_name = "demos-ci"
  vpc_security_group_ids = [
    "sg-724c140b"]
  user_data = "${file("userdata.sh")}"
  iam_instance_profile = "ecsInstanceRole"
  tags {
    Name = "ecs-instance"
  }
}