## Change what it is send to the lambda:

    In integration request, select body mapping templates

        when there are no templates defined
        content-type=application/json
            generate template=method request passthrough

See https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html#input-variable-reference

To send only a part of the body, add:

    "age": $input.json($.personData.age),


event will contains something like that:

    {

        'body-json': { personData: {name: 'max', age: 28} },

        age: 28,

        params: { path: {}, querystring: {}, header: {} },

        'stage-variables': {},

        context: {

            'account-id': xxx

        }

    }

## Change what it is returned by the lambda:

  Same as below but in integration response

        select body mapping templates
        content type = application/json

        {

            "your-age": $input.json('$')

        }

## Add a model:

See http://json-schema.org/

And     https://spacetelescope.github.io/understanding-json-schema/

Select Models :

    {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "title": "CompareData",
      "type": "object",
      "properties": {
        "age": {"type": "integer"},
        "height": {"type": "integer"},
        "income": {"type": "integer"}
      },
      "required": ["age", "height", "income"]
    }

In the POST method request:

    in request body add a model:
        content-type = application/json
        model name = select your model

    in request validator :
        select validate body

In the POST integration request:

    in body mapping templates
        generate template = CompareDate model
        #set($inputRoot = $input.oath('$'))
        {
            "age" : $inputRoot.age,
            "height" : $inputRoot.height,
            "income": $inputRoot.income
        }

## Send a param:

    create a resource
        name = type
        path = {type}

    in integration template:
        {
            "type": "$input.params('type')"
        }

## DynamoDB

https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html

You need to create a table called "compare-yourself" (go to DynamoDB/create table named compare-yourself with a partition key named UserId).

### Read in table

Create a policy to read data in the compare-yourself table:
  go to IAM/Policies,
  Create policy
  Service = DynamoDB
  Actions = select scan and getitem
  Resources = ARN of your DynamoDB table found in its overview
  Give name dynamodb-get-scan

Create a new role named cy-get-data-role and attach dynamodb-get-scan policy to it.

Attach also AWSLambdaBasicExecutionRole to it, to add the permission to create logs.

In lambda cy-get-data select cy-get-data-role as execution role.

### Write in table

Create a policy to write data in the compare-yourself table:
  go to IAM/Policies,
  Create policy
  Service = DynamoDB
  Actions = select putitem
  Resources = ARN of your DynamoDB table found in its overview
  Give name dynamodb-putitem

Attach dynamodb-putitem policy to cy-store-data-role.

In lambda cy-store-data select cy-store-data-role as execution role.

### Delete in table

Create a policy to delete data in the compare-yourself table:
  go to IAM/Policies,
  Create policy
  Service = DynamoDB
  Actions = select deleteitem
  Resources = ARN of your DynamoDB table found in its overview
  Give name dynamodb-deleteitem

Create a new role named cy-delete-data-role and attach dynamodb-deleteitem policy to it.

Attach also AWSLambdaBasicExecutionRole to it, to add the permission to create logs.

In lambda cy-delete-data select cy-delete-data-role as execution role.

## Using API gateway custom authorizers

See https://docs.aws.amazon.com/apigateway/latest/developerguide/use-custom-authorizer.html

Create under Authorizers a new authorizer named simple-custom-auth.

It will use cy-custom-auth as lambda function.

As lambda event payload, use a token with token source = Authorization.

Test using codepen-with-headers-and-data-custom-auth.js file.

## Authorization with Cognito

https://aws.amazon.com/fr/cognito/

https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html

https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html

https://aws.amazon.com/cognito/pricing

https://github.com/aws/aws-amplify/tree/master/packages/amazon-cognito-identity-js

### Create a user pool

Give it compare-yourself as name and click on "Step through settings".

Keep all by default except for "App clients".

Add an app client with "app client name" equal to compare-yourself-angular.
Disable "Generate client secret".

### Create a new authorizer

Named compare-yourself-user-pool, with token source = Authorization and select your user pool.

To protect your API and request the user to be authenticated:

In the POST method of /compare-yourself resource, in Method Request, change Authorization and select compare-yourself-user-pool.

Same for DELETE method of /compare-yourself resource.

Same for GET method of /compare-yourself/{type} resource.

## S3

https://docs.aws.amazon.com/AmazonS3/latest/dev/Welcome.html

https://docs.aws.amazon.com/AmazonS3/latest/dev/s3-access-control.html

https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html

https://aws.amazon.com/s3/pricing/?nc1=h_ls

### Store our SPA

We will use S3 to store our SPA.

Create a bucket named "your domain"-compare-yourself.

Create the single page application files by launching the command: npm run build.

Upload the dist folder content into your bucket.

https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html#example-bucket-policies-use-case-2

In Permissions, add a bucket policy to give read only access to your bucket:

```json
  {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AddPerm",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::<your bucket name>/*"
        }
    ]
  }
```

In Properties, select "Static website hosting", and "Use this bucket to host a website".
For "Index document", enter index.html.
For "Error document", enter also index.html.

### Logging

Create a bucket named "your domain"-compare-yourself.logs.

In "your domain"-compare-yourself bucket, in Properties, select "Server access logging", select "Enable logging" and choose <your domain>-compare-yourself.logs bucket and set "Log Prefix" to log.

## CloudFront

https://aws.amazon.com/cloudfront/

https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html

https://aws.amazon.com/cloudfront/pricing/

We will share our front application in all world by using CloudFront which will automatically distribute our bucket in all world.

Select CloudFront service and create a new Web Distribution.

Select the "Origin Domain Name" as "your domain"-compare-yourself.
Leave all fields as they are except for:
  * "Compress Objects Automatically" to Yes,
  * "Default Root Object" to index.html,
  * "Logging" to On
  * "Bucket for Logs" to your logs bucket
  * "Log Prefix" to cdn

## Route 53

https://aws.amazon.com/route53/

https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html

https://aws.amazon.com/route53/pricing/

https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/registrar.html

First you must registered a new domain in route 53 like compare-yourself.net.

Then you must change your CloudFront distribution:

Edit your distribution and in "Alternate Domain Names" add :
```
compare-yourself.net
www.compare-yourself.net
```

In Route 53, select "Hosted zones" and create a new record set:

Select type IPv4-address and alias=yes. You must select in "Alias target" the new alternate domain name created in your CloudFront distribution compare-yourself.net.

Create another record set with name=www and alias www.compare-yourself
