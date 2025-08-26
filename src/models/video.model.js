import mongoose, { Schema } from "mongoose";



import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  videoFile: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  tags: {
    type: [String],
    default: []
  },
  duration: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("video", videoSchema);
