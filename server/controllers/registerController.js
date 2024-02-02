
const  client  =  require("../config/dbConn");
const path = require('path');
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
    const { emp_name, emp_id, emp_cnic , u_roles, pwd} = req.body;
    if (!emp_id || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
    // check for duplicate employee_id in the db
    const duplicate = await client.query(`SELECT * FROM register_tb WHERE emp_id= $1;`, [emp_id]) ;
    // Count row from Query of result 
    if (duplicate.rowCount===1) return res.sendStatus(409); //Conflict 
    try {
        //encrypt the password
        const hashedPwd = await bcrypt.hash(pwd, 10);
        //store the new user
        const newUser = {
            "e_name": emp_name,
            "e_id": emp_id,
            "e_cnic": emp_cnic,
            "roles": u_roles,
            "password": hashedPwd
        };

        
        await client.query(`INSERT INTO register_tb (emp_name, emp_id, emp_cnic, roles, password) VALUES ($1,$2,$3,$4,$5);`, [newUser.e_name, newUser.e_id, newUser.e_cnic, newUser.roles, newUser.password], (err) => {
              
               if (!err){
                
                res.status(201).json({ 'success': `New user ${emp_name} created!` });
               
               }else{
                res.status(422).json({ 'unsuccess': `No user ${emp_name} created!` });
               }

               

    });
        
        //console.log(us);
        
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleNewUser };