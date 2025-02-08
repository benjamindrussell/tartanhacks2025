const express = require('express');
const router = express.Router();
const Workflow = require('../models/Workflow');
const { updateWorkflowCache } = require('../utils/workflowCache');

// Get all workflows
router.get('/', async (req, res) => {
  try {
    const workflows = await Workflow.find().sort({ createdAt: -1 });
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific workflow by ID
router.get('/:id', async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new workflow
router.post('/', async (req, res) => {
  try {
    const { title, description, action, urls } = req.body;
    
    const newWorkflow = new Workflow({
      title,
      description,
      action,
      urls,
      active: true
    });

    const savedWorkflow = await newWorkflow.save();
    
    // Only try to update cache if the function exists
    if (typeof updateWorkflowCache === 'function') {
      updateWorkflowCache(savedWorkflow);
    }
    
    res.status(201).json(savedWorkflow);
  } catch (error) {
    console.error('Workflow creation error:', error);
    res.status(400).json({ 
      message: 'Failed to create workflow',
      error: error.message 
    });
  }
});

// Update workflow active status
router.patch('/:id/toggle-active', async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    workflow.active = !workflow.active;
    const updatedWorkflow = await workflow.save();
    res.json(updatedWorkflow);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 