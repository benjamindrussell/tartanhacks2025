const router = require('express').Router();
const Workflow = require('../models/Workflow');

// Get all workflows
router.get('/', async (req, res) => {
  try {
    const workflows = await Workflow.find();
    // console.log(workflows);
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
    const { title, description, actions } = req.body;
    
    const newWorkflow = new Workflow({
      title,
      description,
      actions
    });

    const savedWorkflow = await newWorkflow.save();
    res.status(201).json(savedWorkflow);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 