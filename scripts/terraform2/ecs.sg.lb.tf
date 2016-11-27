resource "aws_security_group" "tfci_lb" {
  name        = "tfci-lb"
  description = "Group for load balancer"
  depends_on  = ["aws_iam_user_policy_attachment.ecs_policy_attach"]
}

resource "aws_security_group_rule" "allow_lb_outbound" {
  type              = "egress"
  from_port         = 0
  to_port           = 65535
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = "${aws_security_group.tfci_lb.id}"
}

resource "aws_security_group_rule" "allow_web_inbound" {
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = "${aws_security_group.tfci_lb.id}"
}
