# Typescript Microservice Template

Deployment to Fargate.

## Getting started

Complete the steps below to deploy your project to AWS. You will set up the service using the AWS console and configure your CI/CD pipeline to deploy the service automatically.

## Create an ECR repository

You must first build your Docker image locally and push it to ECR to be able to configure your Fargate srevice. After manually configuring it, your pipeline will be able to automatically deploy any new versions of the service.

1. Create a new ECR repository.
2. Using the push commands in the **View push commands** window, build and push your Docker image from your local computer.

## Store your environment variables on AWS Secrets Manager

The best practice for storing your application's environment variables is to place them in a secret on AWS Secret Manager. Then you can insert this secret into your application's environment and it will be processed automatically.

1. Create a new secret in the AWS Secrets Manager console.
2. Choose Other as secret type and defined all your environmnet variables in separate rows.
3. After creating the secret, note down the ARN.

### Route53 - create your subdomain

For accessing your service via HTTP API, you must define a subdomain which will be later connected to your task definition.

1. Create a new record under the hosted zone `autosense-cloud.com`
2. Define the subdomain you want for your service.
3. Change the record type to CNAME and keep it as not alias.
4. In the Value field, insert your Load balancer URL: `autosense-secure-1194175686.eu-west-1.elb.amazonaws.com`
5. Note down the full HTTPS subdomain URL.

### Create a Target Group

A target group is like a mailing address you can claim for your service. It will be the destination of the incoming traffic from the load balancer and will also monitor your service's health via the health-check endpoint.

1. Go to EC2 dashboard and find the Target Groups tab.
2. Create a new target group of type **IP addresses**.
3. Name your target group.
4. Choose protocol `HTTP` and port `80`. These settings apply for network communication inside your VPC.
5. Select the one VPC called autosense.
6. Define your health-check route. By default it's `/health-check/ping`
7. Go to next page and click Create.

### Add your Target Group to the Load Balancer

You will connect the incoming traffic in the load balancer to reach your service via the target group.

1. Go to Load Balancers, and click `autosense-secure`, select `Listeners` tab, find and click on Listener ID `HTTPS : 443`.
2. Select `Rules` tab and click on `Manage rules` button.
3. Click the `(+)` icon on top, then **Insert rule** to add a new rule.
4. Under condition, choose Host header and insert the full subdomain URL you defined in Route53, for example: `ts-microservice-template.autosense-cloud.com`
5. Add new action: Forward to... then choose your previously created target group.
6. Click save.

### Create an ECS Task Definition

Here you will configure a task definition, it's basically a template of how to run an instance of your service. You will also store this configuration in your project as code, so your pipeline can redeploy a new version automatically.

1. Go to ECS console and click Create new Task Definition.
2. Select `ecsTaskExecutionRole` for Task and Task Execution Role.
3. Set task size. default minimum is 0.5GB and 0.25vCPU.
4. Add a container and reference your ECR image without the version. For example: `692087017035.dkr.ecr.eu-west-1.amazonaws.com/as-typescript-microservice-template`
5. Map your container port. By default it's 3000.
6. Add your SSM secret as an environment variable with the name `AWS_ENVIRONMENT_VARIABLES` and using valueFrom to provide your secret's ARN.
7. After clicking create, copy the JSON configuration into your `task-definition.json` file in your project.
8. Remove the following properties from your local `task-definiton.json` file: `requiresAttributes`, `compatibilities`, `revision`, `taskDefinitionArn` and `status`.

### Create a new ECS service

1. Go to Amazon ECS Console, create a new service and choose the task definition family created above with the latest version.
2. Under network settings, choose the one available Cluster VPC.
3. Choose all three internal subnets.
4. Select an existing security group called `autosense-default-security`
5. Auto-assign public IP: DISABLED
6. Choose Application Load Balancer (this will let you route the incoming traffic to your service)
7. Click on **Add to Load Balancer**.
8. Choose `443:HTTPS` as Production Listening Port.
9. Pick your target group created in the previous steps.
10. Disable service discovery.
11. Go to the next step and click Create Service.

### Done! Run your pipeline

After completing the above steps, you can commit your changes and the Github Actions will take care of deploying a new version of your service on each push.

### Troubleshooting

- Make sure to call your service using HTTPS protocol, otherwise you will get a timeout.
- It should take about 5 minutes for your subdomain to be accessible after configuring it.

## Npm commands

| Command       | Description                            |
| ------------- | -------------------------------------- |
| npm start     | Start local dev server with hot-reload |
| npm test      | Run tests                              |
| npm test:ci   | Run tests in pipeline without dotenv   |
| npm run lint  | Lint and fix                           |
| npm run build | Builds typescript project              |

## Environment variables

The application runs in 3 different environments where the environment variables must be defined.

| Environment    | Tool                     | Description                                                                                                   |
| -------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Local          | dotenv                   | See `.env.example` to create your `.env` config which auto-loads the environment in local development         |
| Github Actions | Github Secrets + AWS SSM | Define AWS Credentials and SECRET_NAME in the GHA workflow to fetch and configure environment from SSM        |
| AWS Fargate    | AWS SSM                  | Application's AWS secret is loaded into the app via `AWS_ENVIRONMENT_VARIABLES` and mapped onto `process.env` |

## Tests

- Place your test files in the same directory where the tested file is.
- Naming convention of your test file: `user-controller.test.ts`
- Jest will load all files ending `.test.ts`
- Code coverage is managed by Istanbul, which is built into Jest. Run `npm test` to see your code coverage.
- You can view your code coverage results by opening the report's `index.html` file in your browser found in the `coverage/` folder after running `npm test`.

## Toolstack

| Feature            | Tool              |
| ------------------ | ----------------- |
| CI/CD              | Github Actions    |
| Server             | Express           |
| HTTP requests      | Axios             |
| Testing framework  | Jest              |
| E2E testing        | Supertest         |
| Linting            | ESLint            |
| Formatting         | Prettier          |
| Container registry | AWS ECR           |
| Deployment         | AWS ECS (Fargate) |

## References

- [Using ESLint and Prettier with Typescript](https://www.robertcooper.me/using-eslint-and-prettier-in-a-typescript-project)
- [AWS Actions for CI pipeline](https://github.com/aws-actions)
