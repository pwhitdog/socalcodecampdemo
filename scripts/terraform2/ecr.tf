resource "aws_ecr_repository" "tfci_ecr" {
  name       = "tf-ci"
  depends_on = ["aws_iam_policy.ecr_policy", "aws_iam_user_policy_attachment.ecr_policy_attach"]
}

resource "aws_iam_policy" "ecr_policy" {
  name        = "tf-ecr"
  description = "Allows terraform to operate on ECR"
  policy = "${file("ecr.policy.json")}"
}

resource "aws_iam_user_policy_attachment" "ecr_policy_attach" {
  user       = "demos-terraform"
  policy_arn = "${aws_iam_policy.ecr_policy.arn}"
}
