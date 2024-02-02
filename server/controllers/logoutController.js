const usersDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}
const fsPromises = require('fs').promises;
const path = require('path');
const  client  =  require("../config/dbConn");

const handleLogout = async (req, res) => {
    // On client, also delete the accessToken

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?

    const foundtoken = await client.query(`select currentuser -> 'refreshToken' as urefreshtoken from logged_tb where currentuser ->> 'refreshToken' = $1 `, [refreshToken]) ;
    console.log(foundtoken.rows[0].urefreshtoken);
    const usertoken = foundtoken.rows[0].urefreshtoken;


    //const foundUser = usersDB.users.find(person => person.refreshToken === refreshToken);
    if (!foundtoken) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: false });
        return res.sendStatus(204);
    }

   

    // Delete refreshToken in db
    // const otherUsers = usersDB.users.filter(person => person.refreshToken !== foundUser.refreshToken);
    // const currentUser = { ...foundUser, refreshToken: '' };
    // usersDB.setUsers([...otherUsers, currentUser]);
    // await fsPromises.writeFile(
    //     path.join(__dirname, '..', 'model', 'users.json'),
    //     JSON.stringify(usersDB.users)
    // );

    await client.query(`delete from logged_tb where currentuser ->> 'refreshToken' = $1 `, [refreshToken]) ;


    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: false });
    res.sendStatus(204);
}

module.exports = { handleLogout }