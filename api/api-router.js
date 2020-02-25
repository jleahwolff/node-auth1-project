const bcrypt = require("bcryptjs");
const router = require("express").Router();

const authRouter = require("../auth/auth-router.js");
const usersRouter = require("../users/users-router.js");


router.use("/auth", authRouter);
router.use("/users", usersRouter);

router.get("/hash", (req, res) => {
  // read the Authentication header
const authentication = req.headers.authentication;

  // hash the value from that header
const hash = bcrypt.hashSync(authentication, 8);

res.json({ originalValue: authentication, hashedValue: hash });

});

router.get("/", (req, res) => {
    res.json({ api: "It's alive" });
});

module.exports = router;