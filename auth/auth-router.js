const bcrypt = require("bcryptjs"); // npm i bcryptjs
const router = require("express").Router();

const Users = require("../users/users-model.js");

router.post("/register", (req, res) => {
let user = req.body;

const hash = bcrypt.hashSync(user.password, 8); // << 1st

user.password = hash; // 2nd

Users.add(user)
.then(saved => {
    res.status(201).json(saved);
})
.catch(error => {
    res.status(500).json(error);
});
});

router.post("/login", (req, res) => {
let { username, password } = req.body;

Users.findBy({ username })
.first()
.then(user => {
    if (user && bcrypt.compareSync(password, user.password)) {
    res.status(200).json({ message: `Welcome back, ${user.username}!` });
    } else {
    res.status(401).json({ message: "Invalid creds" });
    }
})
.catch(error => {
    res.status(500).json(error);
});
});

module.exports = router;