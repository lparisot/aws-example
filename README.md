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

    http://json-schema.org/

    https://spacetelescope.github.io/understanding-json-schema/

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
