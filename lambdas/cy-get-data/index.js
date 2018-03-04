exports.handler = (event, context, callback) => {
    const type = event.type;
    console.log(event);
    if (type == 'all') {
        callback(null, 'all data is here');
    } else if (type == 'single') {
        callback(null, 'The single user data is here');
    } else {
        callback(null, 'type \''+type+'\' is not valid');
    }
};