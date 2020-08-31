//@ts-check
const mongoose = require('mongoose');

/**
 * Returns the object structure for defining an ObjectId that must already exist in the database.
 * @param {mongoose.Model | string} dbCollection Either the mongoose.Model, or lowercase plural string name of the collection to validate against for valid IDs. The string option is provided in the case of circular dependencies and defaults to mongodb query drivers.
 * @returns {Object} Object definition for representing an ObjectId
 */
module.exports.ExistingID = function(dbCollection){
  let collectionName = (typeof dbCollection === 'string' ? dbCollection : dbCollection.modelName);
  return {
            // @ts-ignore
            type: mongoose.ObjectId, //mongoose.ObjectId
            ref: collectionName,
            validate: {
              validator: value => { 
                return ( 
                  typeof dbCollection==='string' ? 
                    mongoose.connection.db.collection(collectionName).findOne(mongoose.Types.ObjectId(value)) : //if string is passed, use native mongo drivers to search collection by string name in case of circular dependencies
                    dbCollection.findById(value) //otherwise just use the model that was passed in //TODO Switch to .exists for better performance
                )
              },
              message: `{VALUE} must match the ID of an existing document in the ${collectionName} collection.`
            }
          }
}

module.exports.Integer = {
  //standard int
  type: Number,
  validate:{
    validator: Number.isInteger,
    message: '{VALUE} is not an integer'
  },
  //positive int
  Positive: {
    type: Number,
    validate:{
      validator: value => Number.isInteger(value) && value>=0,
      message: '{VALUE} is not a positive integer'
    }
  }
}