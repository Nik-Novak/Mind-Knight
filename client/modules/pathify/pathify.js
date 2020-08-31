//@ts-check
import _ from 'lodash'
import {inspect} from 'util'
export function composite(obj){
  // console.log('HERE', obj)
  let retObj = {};
  Object.entries(obj).forEach(([key, value])=>{
    let movingReference = retObj;
    let paths = key.split('.');
    if(paths.length>1){
      // console.log(paths);
      for(let i=0; i<paths.length-1; i++){
        let path = paths[i];
        if(movingReference[path]===undefined)
          movingReference[path] = {}
        // console.log('movingReference[path]===undefined', movingReference[path]===undefined)
        movingReference= movingReference[path];
        // console.log('movingReference', movingReference);
      };
    } 
    movingReference[paths[paths.length-1]] = _.cloneDeep(value);
  });
  // console.log('HERE', retObj)
  return retObj;
}
/**
 * Safely traverses an object to attempt to return a value. If it comes across non-object or non-array values before the final leaf, it will return the undefinedtype
 */
export function safeAccess(obj, path, undefinedType=undefined){
  if(!obj) return undefinedType;
  let compositePaths = path.split('.');
  let movingReference = obj;
  for(let subpath of compositePaths){
    // console.log(`path:${path} paths:${compositePaths} subpath:${subpath} movingReference:${inspect(movingReference,false,0)} movingReference.subpath:${inspect(movingReference[subpath], false, 0)}`)
    if(movingReference[subpath]!==undefined)
      movingReference = movingReference[subpath]
    else
      return undefinedType;
  };
  return movingReference;
}