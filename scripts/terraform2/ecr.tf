resource "aws_ecr_repository" "tfci_ecr" {
  name       = "tf-ci"
  depends_on = ["aws_iam_policy.ecr_policy", "aws_iam_user_policy_attachment.ecr_policy_attach"]
}

resource "aws_iam_policy" "ecr_policy" {
  name        = "tf-ecr"
  description = "Allows terraform to operate on ECR"
  policy      = "${file("ecr.policy.json")}"
}

resource "aws_iam_user_policy_attachment" "ecr_policy_attach" {
  user       = "demos-terraform"
  policy_arn = "${aws_iam_policy.ecr_policy.arn}"
}

data "template_file" "update-image" {
  template = "${file("update-image.tpl")}"

  vars {
    REPOSITORY_NAME = "${aws_ecr_repository.tfci_ecr.name}"
    REPOSITORY_URL  = "${aws_ecr_repository.tfci_ecr.repository_url}"
  }
}

output "update-image-script" {
  value = "${data.template_file.update-image.rendered}"
}
