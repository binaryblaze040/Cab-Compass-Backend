export const EmployeeSchema = {
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
    },
    geoCode: {
        longitude: {
            type: Number,
            required: false
        },
        latitude: {
            type: Number,
            required: false
        }
    }
};

export const CabSchema = {
    registrationNumber: {
        type: String,
        required: true,
        unique: true
    },
    driverName: {
        type: String,
        required: true
    },
    driverLicenseNumber: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true  
    },
    available: {
        type: Boolean,
        default: false
    },
    capacity: {
        type: Number,
        required: true
    }
};