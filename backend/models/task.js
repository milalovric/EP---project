const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    tasks: {
        type: String,
        required: true
    },
    user: {
        type: [String],
        
    },
    deadline: {
        type: Date,
        required: true
    },
    hours: {
        type: String,
    },
    status: {
        type: String,
        required: true
    }
});

schema.pre('save', function(next) {
    if (this.status === 'Active' && this.deadline && this.deadline < new Date()) {
        this.status = 'Expired';
    }
    next();
});


const Task = mongoose.model('Task', schema);

module.exports = Task;
