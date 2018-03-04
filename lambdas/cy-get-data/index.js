const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({ region: 'eu-west-3', apiVersion: '2012-08-10' });

exports.handler = (event, context, callback) => {
    const type = event.type;
    
    if (type == 'all') {
        const params = {
            TableName: "compare-yourself"
        };
        dynamodb.scan(params, function(err, data) {
            if (err) {
                console.log(err, err.stack); // an error occurred
                callback(err);
            }
            else {
                console.log(data); // successful response
                const items = data.Items.map(
                    (dataField) => {
                        return {age: +dataField.Age.N, height: +dataField.Height.N, income: +dataField.Income.N}
                    }
                );
                callback(null, items);
            }
        });
    }
    else if (type == 'single') {
        const params = {
            Key: {
                "UserId": {
                    S: "user_0.236800961716356"
                }
            },
            TableName: "compare-yourself"
        };
        dynamodb.getItem(params, function(err, data) {
            if (err) {
                console.log(err, err.stack); // an error occurred
                callback(err);
            }
            else {
                console.log(data); // successful response
                callback(null, [{age: +data.Item.Age.N, height: +data.Item.Height.N, income: +data.Item.Income.N}]);
            }
        });
    }
    else {
        callback('type \'' + type + '\' is not valid');
    }

};
