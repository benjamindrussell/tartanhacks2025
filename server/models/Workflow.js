const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  urls: [{
    type: String,
    required: true
  }]
}, {
  timestamps: true
});

const Workflow = mongoose.model('Workflow', workflowSchema);

module.exports = Workflow; 