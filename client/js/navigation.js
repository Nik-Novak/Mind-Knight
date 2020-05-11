//@ts-check
// @ts-ignore
String.prototype.betterReplace = function(search, replace, from) {
  if (this.length > from) {
    return this.slice(0, from) + this.slice(from).replace(search, replace);
  }
  return this;
}

function nav(path){
  let absolute = path.startsWith('/');
  window.location.assign(absolute ? pathJoin([window.location.origin, path])  : pathJoin([window.location, path]));
}

function pathJoin(parts, sep){
  var separator = sep || '/';
  var replace   = new RegExp(separator+'{1,}', 'g');
  let joined = parts.join(separator);
  return joined.betterReplace(replace,separator,joined.indexOf('://') + 3);
}
