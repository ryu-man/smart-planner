const mongoose = require("mongoose");
const timeStamps = require("mongoose-timestamps");

const detailSchema = mongoose.Schema({});
const schema = mongoose.Schema({
  begin: {
    hour: {
      type: Number,
      required: true
    },
    minute: {
      type: Number,
      required: true
    }
    //trim:true
  },
  end: {
    hour: {
      type: Number,
      required: true
    },
    minute: {
      type: Number,
      required: true
    }
    //trim: true
  }
});
schema.virtual("duration").get(() => {});
schema.plugin(timeStamps);

module.exports = mongoose.model("DayUnite", schema);
