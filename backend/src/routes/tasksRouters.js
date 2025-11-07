import express from 'express';
import { createAllTasks, deleteTask, getAllTasks, updateTask } from '../controllers/taskscontrollers.js';
const router= express.Router();

export default router;

router.get("/", getAllTasks);

router.post("/", createAllTasks);

router.put("/:id", updateTask);

router.delete("/:id", deleteTask);