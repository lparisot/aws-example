var xhr = new XMLHttpRequest();
xhr.open('GET', 'https://HOST.execute-api.YOUR-REGION.amazonaws.com/dev/compare-yourself/all');
xhr.onreadystatechange = function(event) {
  console.log(event.target.response);
}
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send();
