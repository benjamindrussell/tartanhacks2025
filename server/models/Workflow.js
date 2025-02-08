const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  urls: [{
    type: String,
    required: true
  }]
});

const workflowSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  actions: [actionSchema]
}, {
  timestamps: true
});

const Workflow = mongoose.model('Workflow', workflowSchema);

module.exports = Workflow; 