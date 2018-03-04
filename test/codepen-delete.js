var xhr = new XMLHttpRequest();
xhr.open('DELETE', 'https://12nfruwte4.execute-api.eu-west-3.amazonaws.com/dev/compare-yourself');
xhr.onreadystatechange = function(event) {
  console.log(event.target.response);
}
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send();
