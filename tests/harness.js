load('../env.js');
window.location = 'index.html';
window.onload   = function() {
  var scripts = document.getElementsByTagName('script');
  load(scripts[0].src);
  eval(scripts[1].innerHTML);
};
