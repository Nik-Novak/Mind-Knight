const fs = require('fs');
module.exports.readCredsFromFile = function(pathToCreds, format='object'){
  credentialsObj = {}
  credentialsArr = [];
  let creds = fs.readFileSync(pathToCreds).toString().trim().split('\n');
  creds.forEach(credline => {
    let arrayFormat = credline.split(' ');
    if(format==='array')
      credentialsArr.push(arrayFormat)
    else
      credentialsObj[arrayFormat[0]] = arrayFormat[1];
  })
  if(format==='array')
    return credentialsArr
  else if (format==='object')
    return credentialsObj
  else throw Error('unsupported format')
}