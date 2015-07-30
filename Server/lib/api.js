exports.addUserScore = function(db, name, value){
  var scores = db.collection('user-scores');
  var score = {};
  score.score = parseInt(value);
  score.name = req.query.name;
  scores.insert(score, function(err, doc) {
    if(err){
      console.log(JSON.stringify({error: true, message: "ERROR Error adding data."+err}));
    }else{
      console.log(JSON.stringify({error: false, id: doc._id , message: "SUCCESS "+doc._id}));
    }
  });
  return;
}

exports.addTeamScore = function(db, name, value){
  var scores = db.collection('team-scores');
  var score = {};
  score.score = parseInt(value);
  score.name = req.query.name;
  scores.insert(score, function(err, doc) {
    if(err){
      console.log(JSON.stringify({error: true, message: "ERROR Error adding data."+err}));
    }else{
      console.log(JSON.stringify({error: false, id: doc._id , message: "SUCCESS "+doc._id}));
    }
  });
  return;
}
