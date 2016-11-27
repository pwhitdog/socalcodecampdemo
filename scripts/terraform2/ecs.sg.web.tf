resource "aws_security_group" "tfci_web" {
  name        = "tfci-web"
  description = "Group for web instances"
  depends_on  = ["aws_iam_user_policy_attachment.ecs_policy_attach"]
}

resource "aws_security_group_rule" "allow_all_outbound" {
  type              = "egress"
  from_port         = 0
  to_port           = 65535
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = "${aws_security_group.tfci_web.id}"
}

resource "aws_security_group_rule" "allow_service_inbound" {
  type              = "ingress"
  from_port         = 3000
  to_port           = 3000
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = "${aws_security_group.tfci_web.id}"
}

resource "aws_security_group_rule" "allow_health_inbound" {
  type                     = "ingress"
  from_port                = 1024
  to_port                  = 65535
  protocol                 = "tcp"
  source_security_group_id = "${aws_security_group.tfci_lb.id}"
  security_group_id        = "${aws_security_group.tfci_web.id}"
}

resource "aws_security_group_rule" "allow_ssh_inbound" {
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = "${aws_security_group.tfci_web.id}"
}
