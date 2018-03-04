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

https://aws.amazon.com/cognito/pricing

https://github.com/aws/aws-amplify/tree/master/packages/amazon-cognito-identity-js
