# AWS minimal policy requirements

The following are the minimum required set of policies to deploy your project based on this template to Fargate via Github Actions.

To see an example of all the configured policies, see the autoSense IAM user the user called `github-actions-fargate-deployment-user`.

## Secrets manager access policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetResourcePolicy",
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret",
        "secretsmanager:ListSecretVersionIds"
      ],
      "Resource": ["arn:aws:secretsmanager:eu-west-1:692087017035:secret:<secret_arn>"]
    }
  ]
}
```

## ECR authorization policy

Required for the `amazon-ecr-login` step in the CI pipeline.

Find user-defined policy on IAM under the name `generic-ecr-authorization-policy`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "GetAuthorizationToken",
      "Effect": "Allow",
      "Action": ["ecr:GetAuthorizationToken"],
      "Resource": "*"
    }
  ]
}
```

## ECR push policy

Find user-defined policy on IAM under the name `generic-ecr-push-policy`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": [
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:CompleteLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:InitiateLayerUpload",
        "ecr:BatchCheckLayerAvailability",
        "ecr:PutImage"
      ],
      "Resource": "arn:aws:ecr:eu-west-1:692087017035:repository/*"
    }
  ]
}
```

## ECS deploy task definition policy

Generic policy to attach to your user: `generic-ecs-deploy-task-definition-policy`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RegisterTaskDefinition",
      "Effect": "Allow",
      "Action": ["ecs:RegisterTaskDefinition"],
      "Resource": "*"
    },
    {
      "Sid": "PassRolesInTaskDefinition",
      "Effect": "Allow",
      "Action": ["iam:PassRole"],
      "Resource": [
        "arn:aws:iam::<aws_account_id>:role/<task_definition_task_role_name>",
        "arn:aws:iam::<aws_account_id>:role/<task_definition_task_execution_role_name>"
      ]
    },
    {
      "Sid": "DeployService",
      "Effect": "Allow",
      "Action": ["ecs:UpdateService", "ecs:DescribeServices"],
      "Resource": ["arn:aws:ecs:<region>:<aws_account_id>:service/<cluster_name>/<service_name>"]
    }
  ]
}
```

## Generic policies on autoSense AWS

You can attach the following policies to your user to allow access to required services:

| Policy name                                 | Description                                         |
| ------------------------------------------- | --------------------------------------------------- |
| generic-ecr-push-policy                     | Allows access to all ECR repos in eu-west-1         |
| generic-ecr-authorization-policy            | Authorizes Github Actions to push to ECR            |
| `generic-ecs-deploy-task-definition-policy` | Allows Github Actions to create new task definition |
