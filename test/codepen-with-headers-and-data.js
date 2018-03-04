var xhr = new XMLHttpRequest();
xhr.open('POST', 'https://HOST.execute-api.YOUR-REGION.amazonaws.com/dev/compare-yourself');
xhr.onreadystatechange = function(event) {
  console.log(event.target.response);
}
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify({age: 28, height: 72, income: 2000}));
