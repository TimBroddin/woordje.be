if (Array.prototype.equals)
  console.warn(
    "Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code."
  );
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
  // if the other array is a falsy value, return
  if (!array) return false;

  // compare lengths - can save a lot of time
  if (this.length != array.length) return false;

  for (var i = 0, l = this.length; i < l; i++) {
    // Check if we have nested arrays
    if (this[i] instanceof Array && array[i] instanceof Array) {
      // recurse into the nested arrays
      if (!this[i].equals(array[i])) return false;
    } else if (this[i] != array[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
};
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", { enumerable: false });

const keypress = async (correct) => {
    process.stdin.setRawMode(true);
    return new Promise((resolve) =>
        process.stdin.once("data", (data) => {
            process.stdin.setRawMode(false);
            const byteArray = [...data];

            if (byteArray.equals([27, 91, 67])) {
                resolve("right");
            } else if (byteArray.equals([27, 91, 68])) {
                resolve("left");
            } else if (byteArray.equals([97])) {
                if (correct) {
                    resolve("left");
                } else {
                    resolve("right");
                }
            } else if (byteArray.length > 0 && byteArray[0] === 3) {
                console.log("^C");
                resolve("save");
            } else {
                console.log(byteArray);
                resolve(data.toString());
            }
        })
    );
};

module.exports = { keypress };
