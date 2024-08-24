const express = require('express');
const route = express.Router();
const controller = require('../controller/user');
const controllers = require('../controller/task');
//const controllerss = require('../controller/myTask');
const { authenticateToken } = require('../controller/user'); 

// User routes
route.post('/api/users', controller.create);
route.post('/login', controller.login);
route.get('/api/users', controller.find);
route.get('/api/users/:id', controller.findOne);
route.put('/api/users/:id', controller.update);
route.delete('/api/users/:id', controller.delete);
route.post('/forgetPassword', controller.forgetPassword);
route.put('/resetPassword',authenticateToken, controller.resetPassword);


// Task routes
route.post('/task', controllers.create);
route.get('/task', controllers.find);
route.put('/task/:id', controllers.update);
route.delete('/task/:id', controllers.delete);

/*route.post('/myTask', controllerss.create); 
route.get('/myTask', controllerss.find);
route.put('/myTask/:id', controllerss.update); 
route.delete('/myTask/:id', controllerss.delete);*/




module.exports = route;