provider "aws" {
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
  region     = "${var.region}"
}

resource "aws_iam_policy" "codecamp_terraform_access" {
  name = "terraform-demo"
  policy = "${file("terraform-demo.json")}"
}

resource "aws_ecr_repository" "codecampci_ecr" {
  name = "codecampci"
}

resource "aws_ecs_cluster" "codecampci_ecs" {
  name = "codecampci"
}

resource "aws_alb" "codecampci_alb" {
  name            = "codecampci"
  security_groups = ["sg-4d6a3134"]

  subnets = ["subnet-65c23212", "subnet-c7db09a2",
    "subnet-840d1dc2",
  ]

  tags {
    Environment = "production"
  }
}

resource "aws_alb_target_group" "codecamp_tg" {
  name     = "codecampci"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = "vpc-3fe3255a"
}

resource "aws_alb_listener" "codecampci_listener" {
  "default_action" {
    target_group_arn = "${aws_alb_target_group.codecamp_tg.arn}"
    type             = "forward"
  }

  load_balancer_arn = "${aws_alb.codecampci_alb.arn}"
  port              = 80
  protocol          = "HTTP"
}

resource "aws_ecs_service" "codecampci_service" {
  name            = "codecampci"
  cluster         = "${aws_ecs_cluster.codecampci_ecs.id}"
  task_definition = "arn:aws:ecs:us-west-2:417922976742:task-definition/codecampci:4"
  desired_count   = 2

  iam_role = "arn:aws:iam::417922976742:role/demos-ci"

  // TODO: use this if terraform created the policy so that terraform can destroy them in the right order

  // depends_on = ["aws_iam_role_policy.foo"]
  depends_on = [
    "aws_ecs_cluster.codecampci_ecs",
  ]
  load_balancer {
    target_group_arn = "${aws_alb_target_group.codecamp_tg.arn}"
    container_name   = "codecampci"
    container_port   = 3000
  }
}

data "template_file" "user_data" {
  template = "${file("userdata.tpl")}"

  vars {
    cluster_name = "${aws_ecs_cluster.codecampci_ecs.name}"
  }
}

resource "aws_launch_configuration" "codecamp_lc" {
  name          = "codecamp"
  image_id      = "ami-7abc111a"
  instance_type = "t2.micro"
  key_name      = "demos-ci"

  security_groups = [
    "sg-724c140b",
  ]

  user_data            = "${data.template_file.user_data.rendered}"
  iam_instance_profile = "ecsInstanceRole"
}

resource "aws_autoscaling_group" "codecamp_asg" {
  name                 = "codecamp"
  launch_configuration = "${aws_launch_configuration.codecamp_lc.name}"
  max_size             = 8
  min_size             = 1
  availability_zones   = ["us-west-2a", "us-west-2b", "us-west-2c"]

  tag {
    propagate_at_launch = true
    key                 = "Name"
    value               = "${aws_ecs_cluster.codecampci_ecs.name}"
  }
}
