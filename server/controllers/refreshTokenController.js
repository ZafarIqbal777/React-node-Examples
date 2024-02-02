// const usersDB = {
//     users: require('../model/users.json'),
//     setUsers: function (data) { this.users = data }
// }


const  client  =  require("../config/dbConn");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    console.log("it corect")
    console.log(req.cookies);
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    console.log(refreshToken);
    
    const foundUser = await client.query(`select currentuser from logged_tb where currentuser ->> 'refreshToken' = $1 `, [refreshToken]) ;
    //const foundUser = usersDB.users.find(person => person.refreshToken === refreshToken);
    console.log('this is refrsh token');
    console.log(foundUser.rows);
    if (!foundUser) return res.sendStatus(403); //Forbidden 

    const user = await client.query(`select currentuser -> 'curruser' -> 'emp_id' as keyemp_id from logged_tb where currentuser ->> 'refreshToken' = $1 `, [refreshToken]) ;
    console.log('this is second query');
    console.log(user.rows[0].keyemp_id);
    const username = user.rows[0].keyemp_id;
    console.log(username);
    //console.log(username.Object(empid));
    const userroles = await client.query(`select currentuser -> 'curruser' -> 'roles' as keyroles from logged_tb where currentuser ->> 'refreshToken' = $1 `, [refreshToken]) ;
    
    const uroles = userroles.rows[0].keyroles;
    console.log(uroles);
    // evaluate jwt 

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || username !== decoded.username) return res.sendStatus(403);
            const roles = Object.values(uroles);
            console.log(roles)
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": decoded.username,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '50s' }
            );
            res.json({ accessToken })
        }
    );
}

module.exports = { handleRefreshToken }