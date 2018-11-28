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

function initSpeciesArray() {
  var request = new XMLHttpRequest();

  request.open("GET", "http://127.0.0.1:3000/species", false);
  request.onload = function() {
    var data = JSON.parse(this.response);

    if (request.status >= 200 && request.status < 400) {
      data.forEach(species => {
        speciesArray.push(species.species);
      });
    } else {
      console.log("error status : " + request.status);
    }
  };

  request.send();
}
/*
function initBouquetsPositions() {
  var request = new XMLHttpRequest();

  request.open("GET", "http://127.0.0.1:5000/positions", false);
  request.onload = function() {
    var data = JSON.parse(this.response);

    if (request.status >= 200 && request.status < 400) {
      data.forEach(species => {
        console.log(JSON.stringify(data, 4, null));
        bouquetPositions.push(species.species);
      });
    } else {
      console.log("error status : " + request.status);
    }
  };

  request.send();
}*/

function initBouquetsPositions() {
  var request = new XMLHttpRequest();

  request.open("GET", "http://127.0.0.1:5000/positions", false);
  request.onload = function() {
    var data = JSON.parse(this.response);

    if (request.status >= 200 && request.status < 400) {
      data.forEach(curr => {
        console.log(JSON.stringify(curr, 4, null));
        bouquetPositions.push(curr);
      });
    } else {
      console.log("error status : " + request.status);
    }
  };

  request.send();
}
