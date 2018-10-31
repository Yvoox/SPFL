class Flower {
  constructor(id, name, color) {
    this.id = id;
    this.name = name;
    this.color = color;
  }

  toString() {
    let toString =
      "ID: " + this.id + " NAME: " + this.name + " COLOR: " + this.color;
    return toString;
  }

  print() {
    console.log(this.toString());
  }
}

class Bouquet {
  constructor(_id, id, nbFlowers, Flowers) {
    this._id = _id;
    this.id = id;
    this.nbFlowers = nbFlowers;
    this.Flowers = Flowers;
  }

  toString() {
    let toString =
      "_id: " +
      this._id +
      " id: " +
      this.id +
      " nbFlower: " +
      this.nbFlowers +
      " Flower: " +
      JSON.stringify(this.Flowers, null, 4);
    return toString;
  }

  print() {
    console.log(this.toString());
  }
}

function loadJSON(path, callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", path, true);
  xobj.onreadystatechange = function() {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

function createDataSet() {
  let bouquets = [];
  //var flower1 = new Flower("123", "flower1", "blue");
  //var flower2 = new Flower("234", "flower2", "red");
  //var flower3 = new Flower("345", "flower3", "yellow");

  //var bouquet1 = new Bouquet("1", { flower1, flower2 });
  //var bouquet2 = new Bouquet("2", { flower1, flower3 });
  //var bouquet3 = new Bouquet("3", { flower1, flower3 });

  //bouquets.push(bouquet1);
  //bouquets.push(bouquet2);
  //bouquets.push(bouquet3);

  var request = new XMLHttpRequest();

  request.open("GET", "http://127.0.0.1:3000/bouquets", false);
  request.onload = function() {
    var data = JSON.parse(this.response);

    if (request.status >= 200 && request.status < 400) {
      data.forEach(bouquet => {
        /*  console.log("B _ID:" + bouquet._id);
        console.log("B ID:" + bouquet.id);
        console.log("B nbFlowers:" + bouquet.nbFlowers);
        console.log("B Flowers:" + bouquet.Flowers);*/

        var incBouquet = new Bouquet(
          bouquet._id,
          bouquet.id,
          bouquet.nbFlowers,
          bouquet.Flowers
        );
        bouquets.push(incBouquet);
      });
    } else {
      console.log("error status : " + request.status);
    }
  };

  request.send();
  return bouquets;
}
