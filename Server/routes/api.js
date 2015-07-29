var express = require('express');
var fs = require("fs");
var path = require('path');
var data = JSON.parse(fs.readFileSync(path.join(__dirname,'../../Client/data/doc.geojson'), "utf8"));
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

router.get("/api/user-scores/best.json", function (req, res) {
  var saves = req.db.collection('user-scores');
  saves.find().sort({score: -1}, function(err, docs){
    docs.slice(0,20);
    if(err){
      res.json({error: true})
    }else{
      res.json({error: false, list: docs});
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

router.get("/api/team-scores/best.json", function (req, res) {
  var saves = req.db.collection('team-scores');
  saves.find().sort({score: -1}, function(err, docs){
    docs.slice(0,20);
    if(err){
      res.json({error: true})
    }else{
      res.json({error: false, list: docs});
    }
  });
});

// function via http://stackoverflow.com/a/4992429
function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}

// Get Space Object function
function getSpaceThing(id){
  return getObjects(data.features, "id", id)[0];
}

// e.g. /api/object/36745/json
router.get("/api/object/:id/:format", function (req, res) {
  var spaceObject = getSpaceThing(req.params.id);
  //console.log("Object", JSON.stringify(spaceObject))
  switch(req.params.format){
    case "html":
      var description = spaceObject.properties.description;
      // Strip out unwanted additon at end
      res.send(description.substring(0, description.length - 80));
      break;
    case "json":
      res.json(spaceObject);
      break;
    default:
      res.json({error: true, message: "ERROR This requested format type is not supported. Try /api/object/:id/json or /api/object/:id/html"});
  }
});

module.exports = router;
