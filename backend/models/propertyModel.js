const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  tags: {
    type: [String],
    required: false,
  },
  images: [
    {
      url: String,
      label: String,
      filename: String,
    }
  ],

  features: {
    interior: [String],
    exterior: [String],
    basement: {
      type: String,
      enum: ["Finished", "Unfinished"],
    },
  },

  generalInfo: {
    propertyAddress: String,
    propertyType: {
      type: [String],
      enum: ["hospital", "restaurant", "school", "mall", "park", "gym"], // dropdown values
      default:[]
    },
    yearBuilt: Number,
    squareFootage: String,
    numberOfBedrooms: Number,
    numberOfBathrooms: Number,
    numberOfFloors: Number,
  },

  location: String, // optional textual location

  radius: {
    type: Number,
    default: 1000, // in meters
  }
});

const Property = mongoose.model("Property", propertySchema);
module.exports = Property;
