// const data = {
//     employees: require('../model/employees.json'),
//     setEmployees: function (data) { this.employees = data }
// }

const  client  =  require("../config/dbConn");


const getAllEmployees = async (req, res) => {
    
      const employee = await client.query('SELECT * FROM employee_tb ORDER BY s_id ');
      if (!employee) {
          return res.status(400).json({ "message": `Employees not found` });
      
        }

        console.log(employee.rows);
      res.json(employee.rows);   


}

const createNewEmployee = (req, res) => {

    const { emp_name, emp_cnic, emp_id, joined_date} = req.body
  
    client.query('INSERT INTO employee_tb (emp_name, emp_cnic, emp_id, joined_date) VALUES ($1, $2, $3, $4) RETURNING *', 
     [emp_name, emp_cnic, emp_id, joined_date], (err) => {
     
        if(err) return res.sendStatus(401); 

        res.status(201).json({message : "Employee is added Successfully"})

      
});
}


const updateEmployee = (req, res) => {
    const employee = data.employees.find(emp => emp.id === parseInt(req.body.id));
    if (!employee) {
        return res.status(400).json({ "message": `Employee ID ${req.body.id} not found` });
    }
    if (req.body.firstname) employee.firstname = req.body.firstname;
    if (req.body.lastname) employee.lastname = req.body.lastname;
    const filteredArray = data.employees.filter(emp => emp.id !== parseInt(req.body.id));
    const unsortedArray = [...filteredArray, employee];
    data.setEmployees(unsortedArray.sort((a, b) => a.id > b.id ? 1 : a.id < b.id ? -1 : 0));
    res.json(data.employees);
}

const deleteEmployee = async (req, res) => {
    // const employee = data.employees.find(emp => emp.id === parseInt(req.body.id));
    // if (!employee) {
    //     return res.status(400).json({ "message": `Employee ID ${req.body.id} not found` });
    // }
    // const filteredArray = data.employees.filter(emp => emp.id !== parseInt(req.body.id));
    // data.setEmployees([...filteredArray]);
    // res.json(data.employees);
    
    const emp_id = req.params.e_id

    const employee = await client.query('DELETE FROM employee_tb where emp_id = $1 ', [emp_id]);
    if (!employee) {
    return res.status(400).json({ "message": `Employees not found` });

  }

  //console.log(employee.rows);
res.json({message : "Employee has been deleted"}); 

}

const getEmployee = async (req, res) => {


const emp_id = req.params.e_id

const employee = await client.query('SELECT * FROM employee_tb where emp_id = $1 ', [emp_id]);
if (!employee) {
    return res.status(400).json({ "message": `Employees not found` });

  }

  //console.log(employee.rows);
res.json(employee.rows); 

}

module.exports = {
    getAllEmployees,
    createNewEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployee
}