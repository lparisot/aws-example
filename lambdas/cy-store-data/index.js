const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({ region: 'eu-west-3', apiVersion: '2012-08-10' });

exports.handler = (event, context, callback) => {
    const params = {
        Item: {
            "UserId": {
                S: "user_" + Math.random()
            },
            "Age": {
                N: event.age
            },
            "Height": {
                N: event.height
            },
            "Income": {
                N: event.income
            }
        },
        TableName: "compare-yourself"
    };
    dynamodb.putItem(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            callback(err);
        }
        else {
            console.log(data); // successful response
            callback(null, data);
        }
    });
};
