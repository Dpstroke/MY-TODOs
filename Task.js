import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  isCompleted: { type: Boolean, default: false },

});

const Task = mongoose.model("Task", taskSchema);

export default Task;
