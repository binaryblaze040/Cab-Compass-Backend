require('dotenv').config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

app.use(cors());


// schemas
const employeeSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true
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
        res.json(employees);
    } catch (error) {
        console.error('Error getting employees:', error);
    }
});

app.post("/employees", async (req, res) => {
    console.log("Line 59: API hit")
    connectMongoDB('GET /employees');
    try {
        const employees = await EmployeeModel.find().exec();
        res.json(employees);
    } catch (error) {
        console.error('Error getting employees:', error);
    }
});


app.listen(process.env.PORT || 8080);