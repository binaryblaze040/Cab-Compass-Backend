import dotenv from 'dotenv';
import express from 'express'; 
import cors from 'cors';
import mongoose from "mongoose";
import axios from 'axios';
import { EmployeeSchema, CabSchema } from "./schema.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


// schemas
const employeeSchema = new mongoose.Schema(EmployeeSchema);
const cabSchema = new mongoose.Schema(CabSchema);

const EmployeeModel = mongoose.model("Employee", employeeSchema);
const CabModel = mongoose.model("Cab", cabSchema);


function connectMongoDB(APIMessage) {
    // mongo connection
    mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected successfully!" + "  API - " + APIMessage))
    .catch(error => console.log("Mongo connection error: ", error));
}

async function getGeocodes(address) {
    const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + process.env.GOOGLE_API_KEY;
    try {
        const response = await axios.get(url);
        return {
            latitude: response.data.results[0].geometry.location.lat,
            longitude: response.data.results[0].geometry.location.lng,
        };
    } catch (error) {
        console.log(error)
        throw new Error('Failed to fetch geocodes: ' + error.message);
    }
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

// add an employee
app.post('/add-employee', async (req, res) => {
    connectMongoDB('POST /add-employee');
    
    console.log(req.body);
    const { employeeId, name, email, contact, designation, address } = req.body;
    if (!employeeId || !name || !email || !contact || !designation || !address) {
        res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const geocodePromise = new Promise(async(resolve, reject) => {
            try {
                req.body.geoCode = await getGeocodes(address);
                resolve();
            } catch (error) {
                reject(error);
            }
        });

        geocodePromise
        .then(async () => {
            const newEmployee = new EmployeeModel(req.body);
            await newEmployee.save();
            res.status(201).json(newEmployee);
        })
        .catch(error => {
            res.status(400).send({ error: error });
        });

    } catch (error) {
        if(error.errorResponse?.errmsg?.includes("E11000")){
            res.status(409).json({ error: error.errorResponse.errmsg });
        }
        else {
            res.status(400).send({ error: error });
        }
    }
});

// edit an employee
app.post('/edit-employee', async (req, res) => {
    connectMongoDB('POST /edit-employee');
    
    console.log(req.body);
    const { employeeId, name, email, contact, designation, address } = req.body;
    if (!employeeId || !name || !email || !contact || !designation || !address) {
        res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const geocodePromise = new Promise(async(resolve, reject) => {
            try {
                req.body.geoCode = await getGeocodes(address);
                resolve();
            } catch (error) {
                reject(error);
            }
        });

        geocodePromise
        .then(async () => {
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
        })
        .catch(error => {
            res.status(400).send({ error: error });
        });
    } catch (error) {
        res.status(400).send({ error: error });
    }
});


// delete an employee
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


// get all cabs
app.get("/cabs", async (req, res) => {
    connectMongoDB('GET /cabs');
    try {
        const cabs = await CabModel.find().exec();
        res.status(200).json(cabs);
    } catch (error) {
        console.error('Error getting cabs:', error);
        res.status(500).send('Internal Server Error');
    }
});

// add a cab
app.post('/add-cab', async (req, res) => {
    connectMongoDB('POST /add-cab');
    
    console.log(req.body);
    const { registrationNumber, driverName, driverLicenseNumber, type, model, contact, capacity } = req.body;
    if (!registrationNumber || !driverName || !driverLicenseNumber || !type || !model || !contact || !capacity) {
        res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const newCab = new CabModel(req.body);
        await newCab.save();
        res.status(201).json(newCab);
    } catch (error) {
        if(error.errorResponse?.errmsg?.includes("E11000")){
            res.status(409).json({ error: error.errorResponse.errmsg });
        }
        else {
            res.status(400).send({ error: error });
        }
    }
});

// edit a cab
app.post('/edit-cab', async (req, res) => {
    connectMongoDB('POST /edit-cab');
    
    console.log(req.body);
    const { registrationNumber, driverName, driverLicenseNumber, type, model, contact, capacity } = req.body;
    if (!registrationNumber || !driverName || !driverLicenseNumber || !type || !model || !contact || !capacity) {
        res.status(400).json({ error: 'All fields are required' });
    }

    try {
		const editCabResult = await CabModel.findOneAndUpdate(
			{ registrationNumber: registrationNumber },
			req.body,
			{new: true}
		);

		if (editCabResult) {
			res.status(200).json(editCabResult);
		} else {
			res.status(404).send({ error: "Cab not found" });
		}
    } catch (error) {
        res.status(400).send({ error: error });
    }
});


app.listen(process.env.PORT || 8080);