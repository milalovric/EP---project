const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    tasks: {
        type: String,
        required: true
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

/*schema.pre('save', function(next) {
    if (this.status === 'Active' && this.deadline && this.deadline < new Date()) {
        this.status = 'Expired';
    }
    next();
});*/

const myTask = mongoose.model('myTask', schema);

module.exports = myTask;
