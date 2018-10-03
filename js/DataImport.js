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
  constructor(id, flowers) {
    this.id = id;
    this.flowers = flowers;
  }

  toString() {
    let toString =
      "ID: " + this.id + " FLOWERS: " + JSON.stringify(this.flowers, 4, null);
    return toString;
  }

  print() {
    console.log(this.toString());
  }
}

function createDataSet(path) {
  let bouquets = [];
  var flower1 = new Flower("123", "flower1", "blue");
  var flower2 = new Flower("234", "flower2", "red");
  var flower3 = new Flower("345", "flower3", "yellow");

  var bouquet1 = new Bouquet("1", { flower1, flower2 });
  var bouquet2 = new Bouquet("2", { flower1, flower3 });
  var bouquet3 = new Bouquet("3", { flower1, flower3 });

  bouquets.push(bouquet1);
  bouquets.push(bouquet2);
  bouquets.push(bouquet3);

  return bouquets;
}
