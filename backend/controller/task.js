const Task = require('../models/task');
const socketBackend = require('../socketBack'); // Import socket module

exports.create = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Content can't be empty" });
    }

    console.log('Received task data:', req.body);

    const task = new Task({
        tasks: req.body.tasks,
        user: req.body.users,
        deadline: req.body.deadline,
        hours: req.body.hours,
        status: req.body.status
    });

    try {
        const data = await task.save();
        console.log('Task saved:', data);
        res.status(201).json(data);

        // Emitirajte notifikaciju svim korisnicima
        const io = socketBackend.getIO();
        if (io) {
            console.log('Emitting notification to all connected clients');
            io.emit('receiveNotification', { message: `A new task has been created: ${req.body.tasks}` });
        } else {
            console.error('Socket.io instance is not available');
        }
    } catch (err) {
        console.error('Error saving task:', err);
        if (!res.headersSent) {
            res.status(500).send({
                message: err.message || "Some error occurred creating task"
            });
        }
    }
};

exports.find = async (req, res) => {
    const searchQuery = req.query.search;

    try {
        const tasks = searchQuery
            ? await Task.find({ tasks: { $regex: searchQuery, $options: 'i' } })
            : await Task.find();
        res.send(tasks);
    } catch (err) {
        if (!res.headersSent) {
            res.status(500).send({ message: "Error retrieving tasks" });
        }
    }
};

exports.update = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Data can't be empty" });
    }

    const id = req.params.id;

    try {
        const data = await Task.findByIdAndUpdate(id, req.body, { new: true });
        if (!data) {
            res.status(404).send({ message: `Can't update task with id ${id}` });
        } else {
            res.send(data);

            // Emitirajte notifikaciju svim korisnicima
            const io = socketBackend.getIO();
            if (io) {
                console.log('Emitting notification to all connected clients');
                io.emit('receiveNotification', { message: `Task has been updated: ${req.body.tasks}` });
            } else {
                console.error('Socket.io instance is not available');
            }
        }
    } catch (err) {
        if (!res.headersSent) {
            res.status(500).send({ message: "Error updating task" });
        }
    }
};

exports.delete = async (req, res) => {
    const id = req.params.id;

    try {
        const data = await Task.findByIdAndDelete(id);
        if (!data) {
            res.status(404).send({ message: `Cannot delete task with id ${id}. Maybe id is wrong` });
        } else {
            res.send({ message: "Task was deleted successfully!" });

            // Emitirajte notifikaciju svim korisnicima
            const io = socketBackend.getIO();
            if (io) {
                console.log('Emitting notification to all connected clients');
                io.emit('receiveNotification', { message: `Task has been deleted: ${data.tasks}` });
            } else {
                console.error('Socket.io instance is not available');
            }
        }
    } catch (err) {
        if (!res.headersSent) {
            res.status(500).send({ message: `Cannot delete task with id ${id}.` });
        }
    }
};