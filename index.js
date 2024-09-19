require('dotenv').config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

app.use(cors());
app.use(express.json());


// schemas
const employeeSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    contact: {
        type: Number,
        required: true  
    },
    designation: {
        type: String
    },
    address: {
        type: String,
        required: true
    }
});

const EmployeeModel = mongoose.model("employee", employeeSchema);


function connectMongoDB(APIMessage) {
    // mongo connection
    mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected successfully!" + "  API - " + APIMessage))
    .catch(error => console.log("Mongo connection error: ", error));
}


// check working status
app.get("/", async (req, res) => {
    res.send("Cab Compass is ready to serve hot APIs!");
});


// get all employees
app.get("/employees", async (req, res) => {
    connectMongoDB('GET /employees');
    try {
        const employees = await EmployeeModel.find().exec();
        res.status(200).json(employees);
    } catch (error) {
        console.error('Error getting employees:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/add-employee', async (req, res) => {
    connectMongoDB('POST /add-employee');
    
    console.log(req.body);
    const { employeeId, name, email, contact, designation, address } = req.body;
    if (!employeeId || !name || !email || !contact || !designation || !address) {
        res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const newEmployee = new EmployeeModel(req.body);
        await newEmployee.save();
        res.status(201).json(newEmployee);
    } catch (error) {
        if(error.errorResponse?.errmsg?.includes("E11000")){
            res.status(409).json({ error: error.errorResponse.errmsg });
        }
        else {
            res.status(400).send({ error: error });
        }
    }
});

app.post('/edit-employee', async (req, res) => {
    connectMongoDB('POST /edit-employee');
    
    console.log(req.body);
    const { employeeId, name, email, contact, designation, address } = req.body;
    if (!employeeId || !name || !email || !contact || !designation || !address) {
        res.status(400).json({ error: 'All fields are required' });
    }

    try {
		const editEmployeeResult = await EmployeeModel.findOneAndUpdate(
			{ employeeId: employeeId },
			req.body,
			{new: true}
		);

		if (editEmployeeResult) {
			res.status(200).json(editEmployeeResult);
		} else {
			res.status(404).send({ error: "Employee not found" });
		}
    } catch (error) {
        res.status(400).send({ error: error });
    }
});

app.post('/delete-employee', async (req, res) => {
    connectMongoDB('POST /delete-employee');
    
    console.log("Delete " + req.body);
    try {
		const deletionResult = await EmployeeModel.deleteOne({employeeId: req.body.employeeId})

		if (deletionResult) {
			res.status(200).json(deletionResult);
		} else {
			res.status(404).send({ error: "Employee not found" });
		}
    } catch (error) {
        res.status(400).send({ error: error });
    }
});


app.listen(process.env.PORT || 8080);