//jshint esversion:6
require('dotenv').config() // npm i dotenv'le paketi indirdik sonra " touch .env " kullanarak yeni bir gizli dosya olsturduk. Bu dosyanin icine sifrelemek istedigin data'ni adini yaz, buraya const yada let gibi seyler yazamassin tirnak isareti virgul noktali virgul gibi isaretlerde kullanamazsin = kullanirken bosluk birakma veri adini buyuk harfle yaz. Orn: const secret = "Thisisourlittlesecret."; i bu sekilde yaz: SECRET=Thisisourlittlesecret. Bu kodu herhangi biyerde cagirmana gerek yok .configleyip en ustte yaz. github'a yuklerken gizlemek icin dosya .env'i .gitignore gizli dosyasina mutlaka yaz
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption"); // Mongoose'un sifreleme paketini indirdik.
const app = express();

console.log(process.env.API_KEY)

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true})

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']}); // .save metodunu kullandiginda sifreler(encrypt), .find metodunu kullandiginda ise sifreyi cozer(decrypt).encryptedFields'a sifrelemek istedigin key'in adini yaz. .model'dan once kullan.
// process.env.SECRET .env gizli dosyasinin icindeki SECRET keyi'nin degerini temsil eder.
const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/login", (req, res) => {
    res.render("login")
})
 
app.get("/register", (req, res) => {
    res.render("register")
})
 
app.post("/register", (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })

    newUser.save()
    .then(() => {
        res.render("secrets");
    });
})

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}) // Girilen username database'e kayitli mi diye ariyoruz.
    .then((foundUser) => {
        
        if(foundUser) { // Eger varsa ..
            if (foundUser.password === password) { // Girdigi sifresiyle eslesiyor mu diye bakiyoruz.
                res.render("secrets")
            }
        }
    }).catch((err) => { console.log(err);})
})


app.listen(3000, () => {
    console.log("Server is running on port 3000..");
});