const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');
const location_controller = require('../controllers/locationController');
const listController = require('../controllers/listsController');
const reviewController = require('../controllers/reviewController');


router.post('/users', user_controller.create);
router.get('/users/:id', user_controller.findOne);
router.get('/users', user_controller.findAll);
router.put('/users/:id', user_controller.update);
router.delete('/users/:id', user_controller.restrict);
router.post('/users/grantAdmin/:id', user_controller.grantAdmin);
router.post('/users/verify/:uid', user_controller.verifyUser);

router.get('/replace', location_controller.replace)

router.get('/locations', location_controller.getDestinations);
router.get('/search', location_controller.search);
router.get('/locations/:id', location_controller.getDestinationById);

router.get("/checkRestriction/:id", user_controller.checkRestriction);
router.post("/restrict/:id", user_controller.restrict);
router.post("/unrestrict/:id", user_controller.unRestrict);

router.post('/list', listController.createList);
router.put('/list', listController.updateList);
router.delete('/list', listController.deleteList);
router.get('/list', listController.getAllLists);
router.post('/list/visibility', listController.listToggleVisibility);
router.get("/list/:id", listController.getListsUser);

router.post('/reviews', reviewController.createReview);

module.exports = router;
