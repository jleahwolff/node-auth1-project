
Steps taken today:
-----------------------SET UP FILE STRUCTURE----------------------------------
1. Add package.json `npm init -y`
    -Add server and start to `Scripts`:
        "server": "nodemon index.js",
        "start": "node index.js"
2. Install dependancies: `npm i nodemon knex sqlite3 express helmet cors bcryptjs`
3. Add knexfile.js `knex init`
    -Add useNullAsDefault and pool into `Development`
    ```js
    development: {
        client: 'sqlite3',
        👉 useNullAsDefault: true,
        connection: {
        filename: './database/auth.db3',
        },
        👉 pool: {
            afterCreate: (conn, done) => {
                conn.run('PRAGMA foreign_keys = ON', done);
            }, 👈
        }, ...
    ```
4. Create server.js file in root folder

5. Create index.js file in root folder
    ```js
    const server = require('./api/server.js');

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => console.log(`\n** Running on port: ${PORT} **\n`));
    ```
4. Start server `npm run server` ⚠ NOT ⚠ `npm start server`
5. Create migrations `knex migrate:make initial`
6. Manually add `dbConfig.js` to database file
```js
const knex = require("knex");

const knexfile = require("../knexfile.js");

const environment = process.env.NODE_ENV || "development";

module.exports = knex(knexfile[environment]);
```
6. Set up database


----------------------SET UP AUTHENTICATION-----------------------
1. Check to see if server is running `npm run server`
2. Not working, so `npm i nodemon`
3. Server listening on port: 5000
4. Test GET /api: ✅
5. Test GET /api/users: ✅ ...😢 
    -we want required authentication to access
6. Test POST /api/register: ⛔
    {
        "username": "jessica-wolff",
        "password": "1234Password."
    }
    -Check the API > router for endpoint
    -Make sure using the correct endpoint
7. Test POST /api/auth/register: ✅
8. Test GET /api/users: ✅ showing ID and Username
    -We want to also see Password
9. Navigate to `users-model`
    -Add "password" to ```function find().select();```
    -Now we can see "id", "username", "password"
    -YOU NEVER WANT THIS - too easy to access
    -What do we do to fix that? `HASH YOUR PASSWORDS`
10. What file can we add that? 
    -`configure-middleware`
    -`users-model`
    -`auth-router`
    -Pick one, and save before pushing to the db
    -Luis will put it in `auth-router.js`
    -But first...
11. Create a new hash endpoint for testing in `api-router.js`
    - ```js
        router.get("/hash", (req, res) => {
        
        <!-- This is where we will be adding bcrypt.js (12) -->

        res.json({ originalValue: authentication, hashedValue: hash });
        });
    ```
12. Learn `bcrypt.js` at https://www.npmjs.com/package/bcryptjs
    -The internal library used whenever we're hashing
    -How to take the string value from `req.header`, hash it, then return both the originalValue(from authentication header) and hashedValue
    -Install `npm i bcryptjs`.. we're using Sync (passing it authentication header, instead of async = callback func)
    -import bcrypt in `api-router`
    - Put this inside our router.get /hash 
        ``` js 
        // how to read the Authentication header
        const authentication = req.headers.authentication;
        // using bcrypt to hash authentication value from header
        const hash = bcrypt.hashSync(authentication, 8);
        ```
        -the number is how many rounds (2^8th) it will be hashed every second. 8 is fast for testing. Higher number = faster for deployment! (Higher num = lower, so 16 is slower than 8)
        -`salt` = random generated string that is added to your password to make it even more secure. Also is part of the hash you get - the library needs to find a way to verify that the password is the same by doing the hashing again, and compares it to the older hashes.
13. Test GET /api/hash: ⛔ "illegal argument undefined"..
    -That means we have to pass in a key:value in headers
    -We're using key: authentication (not a given variable), value: salt bae, then, SEND.
    -First Round(8) - hashedValue: $2a$08$nIBX.7EGS/MG83Ogiv/1J.npDvKs/Bxm69l9A7.HdjMw8mA6nM.22
    -Second Round(8) - hashedValue: $2a$08$6jEYYMGjyYi1aM/MfYsbtOy9OqDHVNQjqLtkXWXdUtQWjHAxulUiq
    -Third Round(16) - hashedValue: $2a$16$NdOA06goDStmODZP4ZJdgOA3EVYIcbsr.ursK9NRm0aETT05GBeqi
--------------------------------------------------------------
14. Now, we will be using this for `auth-router.js`. So copy, paste:
```js
    const bcrypt = require("bcryptjs"); // at imports on top
    //inside router.post("/register")
    //change authentication to user.password because that's what we want to hash
    const hash = bcrypt.hashSync(user.password, 8);
```
15. Tell the request to use the hash as the users password:
```js
    user.password = hash;
```
16. Test POST /api/auth/register: ✅
    {
        "username":"nick-anderson",
        "password":"pass123"
    }
17. Test GET /api/users: ✅ (We will not see results in final version)
    -Now the password is hashed. 
    👍
------------------------------------------------------------
Now, let's do this for /login, we will read credentials and make sure they are good, using `bcryptjs` library
Steps:
- Implement login
- Read credentials (username, password)
- Validate credentials
    - Good: let them continue
    - Bad: 401 error not authenticated

1. What code/method will let us check passwords and compare with each other? `bcrypt.compareSync`
2. How do we know the hash for the user's password? It should be coming from the database. 
Therefore, in the router.post("/login") request, 
```js 
router.post("/login", (req, res) => {
  let { username, 👉password 👈 } = req.body; //password is the guess from the req.body

  Users.findBy({ username })
    .first()
    .then(user => {
      👉if (user && bcrypt.compareSync(password, user.password)👈 //and user.password comes from the database. We stored it under user.password, so we'll get it back using user.password in our compareSync
      {
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: "Invalid Credentials" });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});
```
3. Test POST/api/auth/login: ✅
    {
        "username":"nick-anderson",
        "password":"pass123"
    }
    - "Welcome, nick-anderson"
    - Check terminal: Will now show user object with id, username and hashed password. (Will not show in final version).  This is a requirement.
4. Look at `user-model.js` function findBy, if we removed the "password" in .select(), it wouldn't work.
    - So, whatever method you are using, the user has to return the password for the username in the `findBy` function. (Unlike `findById`)
--------------------------------------------------------
Lastly, we want to set up a requirement that you cannot GET /api/users without the proper credentials. 
1. How do we do that? Why can't we just copy the validation we just made for the `login request` in `auth-router` and paste it in the other router? We could simply write a middleware function that is reusable, so that we dont have to write wet code. 
2. Create a `restricted-middleware.js` function

```js
const bcrypt = require("bcryptjs");
const Users = require("../users/users-model.js");

module.exports = (req, res, next) => {
  let { username, password } = req.headers; //Header will work with GET and PUT 

  if (username && password) {
    Users.findBy({ username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          next();
        } else {
          res.status(401).json({ message: "Invalid Credentials" });
        }
      })
      .catch(({ name, message, stack }) => {
        res.status(500).json({ name, message, stack });
      });
  } else {
    res.status(400).json({ error: "please provide credentials" });
  }
};
```
3. What is required in a middleware? (req, res, next)
4. Where are we getting { username, password } from since we want to use it with GET request? `req.headers`
5. Will we want to reference the database? Yes, so we can see if that user exists in the db, and compare password. So we need to import `users-model.js`. 
6. Instead of spitting out a `res.status` in our if statement, what do we do in middleware for it to be reusable? `next();`
7. How do we protect everything from being readable without credentials by putting it in one place? Import into `api-router.js` and add restricted into the `router.use("/users")`
8. 
```js
const restricted = require("../auth/restricted-middleware.js");

router.use("/users", restricted, usersRouter);
```
9. Test GET /api/users: ⛔ //{} and 500 internal server error... why?
    - We're not checking to see if we have a username first.
10. How do we fix that? 
11. Go to `restricted-middleware.js`, we want MORE out of our .catch().  So instead of .catch(error), replace it with 
```js .catch(({name, message, stack}) =>{
    res.status(500).json({ name, message, stack })
})
```
12. Isn't that the same thing as before? Yes, but we get MUCH more information from it now. The JSON is not mutable, there are a couple things JSON cannot parse. If these three things are not in a JSON object, it will not show up.
13. How do we get past this error now?  Check for username && password truthy. Wrap the `restricted-middleware` in an if statement. Else, throw a 400 error.
13. TEST GET /api/users: ⛔
14. Give Header a Key:Value pair...
    username: nick-anderson
    password: pass123
15. SUCCESS. ✅

