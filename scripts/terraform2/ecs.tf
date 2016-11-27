resource "aws_ecs_cluster" "tfci" {
  name       = "tfci"
  depends_on = ["aws_iam_user_policy_attachment.ecs_policy_attach"]
}

resource "aws_iam_policy" "ecs_policy" {
  name        = "tf-ecs"
  description = "Allows terraform to operate on ECS"
  policy      = "${file("ecs.policy.json")}"
}

resource "aws_iam_user_policy_attachment" "ecs_policy_attach" {
  user       = "demos-terraform"
  policy_arn = "${aws_iam_policy.ecs_policy.arn}"
}

data "template_file" "user_data" {
  template = "${file("userdata.tpl")}"

  vars {
    cluster_name = "${aws_ecs_cluster.tfci.name}"
  }
}

//resource "aws_launch_configuration" "tfci" {


//  name          = "tfci"


//  image_id      = "ami-7abc111a"


//  instance_type = "t2.micro"


//  key_name      = "${var.key_pair_name}"


//


//  security_groups = [


//    "sg-724c140b",


//  ]


//


//  user_data            = "${data.template_file.user_data.rendered}"


//  iam_instance_profile = "ecsInstanceRole"


//}

