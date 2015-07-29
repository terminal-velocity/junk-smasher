var express = require('express');
var router = express.Router();

router.get("/api/test", function(req, res){
	res.send("Hello, test");scores
});


router.get("/api/user-scores/new", function(req, res){
  var scores = req.db.collection('user-scores');
  var score = {};
  if(!req.query.score){
    score.score = 0;
  }else{
    score.score = parseInt(req.query.score);
  }
  score.name = req.query.name;
  scores.insert(score, function(err, doc) {
    if(err){
      res.json({error: true, message: "ERROR Error adding data."+err});
    }else{
      res.json({error: false, id: doc._id , message: "SUCCESS "+doc._id});
    }
  });
});

router.get("/api/team-scores/new", function(req, res){
  var scores = req.db.collection('team-scores');
  var score = {};
  if(!req.query.score){
    score.score = 0;
  }else{
    score.score = parseInt(req.query.score);
  }
  score.name = req.query.name;
  scores.insert(score, function(err, doc) {
    if(err){
      res.json({error: true, message: "ERROR Error adding data."+err});
    }else{
      res.json({error: false, id: doc._id , message: "SUCCESS "+doc._id});
    }
  });
});

module.exports = router;
