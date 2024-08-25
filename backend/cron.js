const cron = require('node-cron');
const Task = require('./models/task');
const myTask = require('./models/myTask');


cron.schedule('*/10 * * * *', () => {
    Task.updateMany({ status: 'Active', deadline: { $lt: new Date() } }, { status: 'Expired' })
        .then(result => {
            console.log(`Updated  tasks to expired status.`);
        })
        .catch(error => {
            console.error('Error updating task statuses:', error);
        });
});

cron.schedule('*/10 * * * *', () => {
    myTask.updateMany({ status: 'Active', deadline: { $lt: new Date() } }, { status: 'Expired' })
        .then(result => {
            console.log(`Updated  tasks to expired status.`);
        })
        .catch(error => {
            console.error('Error updating task statuses:', error);
        });
});
