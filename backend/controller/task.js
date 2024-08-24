const Task = require('../models/task');
exports.create = (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: "Content can't be empty" });
        return;
    }
    
    console.log('Received task data:', req.body);
    
    const task = new Task({
        tasks: req.body.tasks,
        user: req.body.users, 
        deadline: req.body.deadline,
        hours: req.body.hours,
        status: req.body.status
    });

    
    task.save()
        .then(data => {
            console.log('Task saved:', data); 
            res.status(201).json(data); 
        })
        .catch(err => {
            console.error('Error saving task:', err);
            res.status(500).send({
                message: err.message || "Some error occurred creating task"
            });
        });
}




exports.find = (req, res) => {
    const searchQuery = req.query.search; 

    if (searchQuery) {
        Task.find({
            tasks: { $regex: searchQuery, $options: 'i' } 
        })
        .then(tasks => {
            res.send(tasks);
        })
        .catch(err => {
            res.status(500).send({ message: "Error retrieving tasks with search query" });
        });
    } else {
        Task.find()
        .then(tasks => {
            res.send(tasks);
        })
        .catch(err => {
            res.status(500).send({ message: "Error retrieving tasks" });
        });
    }
};


exports.update = (req, res) => {
    if(!req.body){
        return res.status(400).send({message:"Data can't be empty"})
    }

    const id=req.params.id;
    Task.findByIdAndUpdate(id,req.body,{useFindAndModify:false, new: true})
    .then(data=>{
        if(!data){
            res.status(404).send({message:`Can't update task with ${id}`})
        }else{
            res.send(data)
        }
    })
    .catch(err =>{
        res.status(500).send({message: "Error Update user "})
    })
};

exports.delete = (req, res)=>{
    const id=req.params.id;

    Task.findByIdAndDelete(id)
        .then(data => {
            if(!data){
                res.status(404).send({ message : `Cannot Delete with id ${id}. Maybe id is wrong`})
            }else{
                res.send({
                    message : "Task was deleted successfully!"
                })
            }
        })
        .catch(err =>{
            res.status(500).send({
                message: `Cannot delete task with id ${id}.`
            });
        });
}