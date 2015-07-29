///leaderboards.json'
function getLeaderboards(url){
  jx.load(url ,function(data){
  document.getElementById("data").innerHTML = "";
	var xdata = JSON.parse(data); // Do what you want with the 'data' variable.
  xdata.list.forEach(function(element, index, array){
    var name;
    if(element.username === null){
      name = "Unnamed";
    }else{
      name = element.name;
    }
    console.log("Name " + name);
    document.getElementById("data").innerHTML =   document.getElementById("data").innerHTML + "<br><b>" + element.score + "</b> - " + name;
  });
});
}
