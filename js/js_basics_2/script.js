var name = 'John';
var lastName = 'Smith';  //camelCase
var age = 27;
var fullAge = true;

var job, isMarried;
console.log(job);  //undefined

var lastNme = prompt('what is the last name?');
console.log(lastNme);

//alert("my name is Coder");
if (fullAge) {
    console.log("He is an adult");
} else {
    console.log("He is still a child");
}

var years = [1990, 1999, 1987, 2004];
var res = [];

function calculateAge(years) {
    var ages = [];
    for (var i = 0; i < years.length; i++) {
        ages[i] = 2018 - years[i];
        if (ages[i] > 18) {
            res[i] = true;
        } else {
            res[i] = false;
        }
        console.log('Age:' + ages[i] + ' res:' + res[i]);
    }
    return res;
}

console.log(calculateAge(years));