const usersDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}


const  client  =  require("../config/dbConn");
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
require('dotenv').config();
const fsPromises = require('fs').promises;
const path = require('path');


const handleLogin = async (req, res) => {
    const { emp_id, pwd } = req.body;
    console.log(req.body);
    if (!emp_id || !pwd) return res.status(400).json({ 'message': 'employee-id and password are required.' });
    const foundUser = await client.query(`SELECT * FROM register_tb WHERE emp_id= $1;`, [emp_id]) ;
    const user = foundUser.rows;

    console.log(user[0].password);
    console.log(user[0]);
    
    if (user.length === 0) return res.sendStatus(401); //Unauthorized 
         
    // evaluate password 
    const match = await bcrypt.compare(pwd, user[0].password);
    if (match) {
        //const roles = user[0].roles;
        //console.log(roles);
        let roles = Object.values(user[0].roles);
        console.log(roles);
        // create JWTs
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": user[0].emp_id,
                    "roles": roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30s' }
        );

        console.log(accessToken);
        const refreshToken = jwt.sign(
            { "username": user[0].emp_id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        // Saving refreshToken with current user
        const curruser = user[0];
        const otherUsers = await client.query(`SELECT * FROM register_tb WHERE emp_id != $1;`, [user[0].emp_id]) ;
        const othusers  = {other: otherUsers.rows};
        console.log(othusers);
        const currentUser = {curruser, refreshToken};
        console.log(currentUser);


        // const otherUsers = usersDB.users.filter(person => person.username !== foundUser.username);
        // const currentUser = { ...foundUser, refreshToken };
        usersDB.setUsers([othusers, currentUser]);
        await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'users.json'),
            JSON.stringify(usersDB.users)
        );
        
        await client.query(`INSERT INTO logged_tb (otherUsers, currentuser) VALUES ($1,$2);`, [othusers, currentUser]);

        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: false, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ accessToken });
    } else {
         res.sendStatus(401);
    }
}

module.exports = { handleLogin };