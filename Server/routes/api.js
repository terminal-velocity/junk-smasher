var express = require('express');
var router = express.Router();

router.get("/api/test", function(req, res){
	res.send("Hello, test");
});

/*
router.get("/api/new", function(req, res){
  var saves = req.db.collection('saves');
  var save = {};
  if(!req.query.level){
    save.level = 0;
  }else{
    save.level = req.query.level;
  }
  save.username = req.query.username;
  saves.insert(save, function(err, doc) {
    if(err){
      res.json({error: true, message: "ERROR Error adding data."+err});
    }else{
      res.json({error: false, id: doc._id , message: "SUCCESS "+doc._id});
    }
  });
});*/

module.exports = router;
