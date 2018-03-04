exports.handler = (event, context, callback) => {
    console.log(event);
    const age = event.age;
    const name = event.name;
    console.log('name:'+name+", age:"+age);
    
    // TODO implement
    callback(null, age * 2);
};