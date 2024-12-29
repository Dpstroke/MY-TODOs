import express from "express";
import Task from "../api/Task.js"; // Update the path as necessary

const router = express.Router();

// Add a new task
router.post("/", async (req, res) => {
  try {
    const { name, description, isCompleted = false } = req.body; // Default isCompleted to false
    const task = new Task({ name, description, isCompleted });
    await task.save();
    res.status(201).json(task); // Return the created task
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// Fetch all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find(); // Fetch all tasks from the database
    res.status(200).json(tasks); // Return tasks as JSON
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Update a task (including completion status)
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isCompleted } = req.body;

    // Update task and return the updated task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { name, description, isCompleted },
      { new: true, runValidators: true } // Ensure validators run on update
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(updatedTask); // Return updated task
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id); // Find and delete task

    if (!deletedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted" }); // Return success message
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
