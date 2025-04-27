HOSPITALS = [
    {
        "id": 1,
        "name": "Central Hospital",
        "country": "Slovakia",
        "city": "Bratislava",
        "street": "Main Street 123",
        "postal_code": "81101",
        "hospital_code": "abcd1234efgh5678",
        "created_at": "2025-01-15",
        "admins": [1],
        "doctors": [1, 2],
        "technicians": [1, 2],
        "patients": [101, 102],
    },
    {
        "id": 2,
        "name": "City Hospital",
        "country": "Slovakia",
        "city": "Kosice",
        "street": "Hospital Street 45",
        "postal_code": "04001",
        "hospital_code": "efgh5678ijkl9012",
        "created_at": "2025-02-10",
        "admins": [3],
        "doctors": [4, 5, 6],
        "technicians": [7, 8],
        "patients": [201, 202, 203],
    },
    {
        "id": 3,
        "name": "Regional Medical Center",
        "country": "Slovakia",
        "city": "Zilina",
        "street": "Health Avenue 78",
        "postal_code": "01001",
        "hospital_code": "ijkl9012mnop3456",
        "created_at": "2025-03-05",
        "admins": [2],
        "doctors": [7, 8],
        "technicians": [9],
        "patients": [301, 302],
    },
    {
        "id": 4,
        "name": "University Hospital",
        "country": "Slovakia",
        "city": "Presov",
        "street": "University Road 12",
        "postal_code": "08001",
        "hospital_code": "mnop3456qrst7890",
        "created_at": "2025-04-01",
        "admins": [4],
        "doctors": [9, 10],
        "technicians": [11],
        "patients": [401, 402, 403],
    },
    {
        "id": 5,
        "name": "Children's Hospital",
        "country": "Slovakia",
        "city": "Nitra",
        "street": "Pediatric Lane 34",
        "postal_code": "94901",
        "hospital_code": "qrst7890uvwx1234",
        "created_at": "2025-05-20",
        "admins": [5],
        "doctors": [11, 12],
        "technicians": [13],
        "patients": [501, 502],
    },
    {
        "id": 6,
        "name": "Specialized Eye Clinic",
        "country": "Slovakia",
        "city": "Trnava",
        "street": "Vision Street 56",
        "postal_code": "91701",
        "hospital_code": "uvwx1234yzab5678",
        "created_at": "2025-06-15",
        "admins": [6],
        "doctors": [13, 14],
        "technicians": [15],
        "patients": [601, 602, 603],
    },
    {
        "id": 7,
        "name": "Orthopedic Hospital",
        "country": "Slovakia",
        "city": "Banska Bystrica",
        "street": "Bone Care Road 89",
        "postal_code": "97401",
        "hospital_code": "yzab5678cdef9012",
        "created_at": "2025-07-10",
        "admins": [7],
        "doctors": [15, 16],
        "technicians": [17],
        "patients": [701, 702],
    },
    {
        "id": 8,
        "name": "Cardiology Center",
        "country": "Slovakia",
        "city": "Poprad",
        "street": "Heart Street 23",
        "postal_code": "05801",
        "hospital_code": "cdef9012ghij3456",
        "created_at": "2025-08-05",
        "admins": [8],
        "doctors": [17, 18],
        "technicians": [19],
        "patients": [801, 802, 803],
    },
    {
        "id": 9,
        "name": "General Hospital",
        "country": "Slovakia",
        "city": "Martin",
        "street": "Care Street 67",
        "postal_code": "03601",
        "hospital_code": "ghij3456klmn7890",
        "created_at": "2025-09-01",
        "admins": [9],
        "doctors": [19, 20],
        "technicians": [21],
        "patients": [901, 902],
    },
    {
        "id": 10,
        "name": "Rehabilitation Center",
        "country": "Slovakia",
        "city": "Zvolen",
        "street": "Recovery Lane 45",
        "postal_code": "96001",
        "hospital_code": "klmn7890opqr1234",
        "created_at": "2025-10-20",
        "admins": [10],
        "doctors": [21, 22],
        "technicians": [23],
        "patients": [1001, 1002],
    },
]

ADMINS = [
    {
        "id": 1,
        "first_name": "Super Admin",
        "last_name": "Johnson",
        "phone_number": "+421987654321",
        "gender": "female",
        "hospital_id": [2, 1],
        "user_type": "super_admin",
        "email": "super.admin.johnson@example.com",  # Added email
        "created_at": "2025-01-01",  # Added created_at
    },
    {
        "id": 3,
        "first_name": "Admin",
        "last_name": "Clark",
        "phone_number": "+421987654322",
        "gender": "female",
        "hospital_id": 1,
        "user_type": "admin",
        "email": "admin.clark@example.com",  # Added email
        "created_at": "2025-02-01",  # Added created_at
    },
]

DOCTORS = [
    {
        "id": 1,
        "first_name": "Doctor",
        "last_name": "Doe",
        "phone_number": "+421123456789",
        "gender": "male",
        "title": "Dr.",
        "suffix": "PhD",
        "super_doctor": True,
        "hospital_id": 1,
        "patients": [101],
        "email": "doctor.doe@example.com",  # Added email
        "created_at": "2025-01-01",  # Added created_at
    },
    {
        "id": 2,
        "first_name": "Jane",
        "last_name": "Smith",
        "phone_number": "+421987654321",
        "gender": "female",
        "title": "Dr.",
        "suffix": "MD",
        "super_doctor": False,
        "hospital_id": 1,
        "patients": [102],
        "email": "jane.smith@example.com",  # Added email
        "created_at": "2025-01-15",  # Added created_at
    },
    {
        "id": 4,
        "first_name": "Michael",
        "last_name": "Johnson",
        "phone_number": "+421123456788",
        "gender": "male",
        "title": "Dr.",
        "suffix": "MD",
        "super_doctor": False,
        "hospital_id": 2,
        "patients": [201, 204],
        "email": "michael.johnson@example.com",  # Added email
        "created_at": "2025-02-01",  # Added created_at
    },
    {
        "id": 5,
        "first_name": "Sarah",
        "last_name": "Williams",
        "phone_number": "+421987654320",
        "gender": "female",
        "title": "Dr.",
        "suffix": "PhD",
        "super_doctor": True,
        "hospital_id": 2,
        "patients": [202, 205],
        "email": "sarah.williams@example.com",  # Added email
        "created_at": "2025-02-10",  # Added created_at
    },
    {
        "id": 6,
        "first_name": "David",
        "last_name": "Brown",
        "phone_number": "+421555666777",
        "gender": "male",
        "title": "Dr.",
        "suffix": "MD",
        "super_doctor": False,
        "hospital_id": 2,
        "patients": [203],
        "email": "david.brown@example.com",  # Added email
        "created_at": "2025-03-01",  # Added created_at
    },
]

TECHNICIANS = [
    {
        "id": 1,
        "first_name": "Technician",  # Updated first name
        "last_name": "Brown",  # Last name remains consistent
        "phone_number": "+421555666777",
        "gender": "female",
        "hospital_id": 1,  # Reference to hospital ID
    },
    {
        "id": 2,
        "first_name": "Bob",
        "last_name": "White",
        "phone_number": "+421444555666",
        "gender": "male",
        "hospital_id": 1,  # Reference to hospital ID
    },
    {
        "id": 7,
        "first_name": "Anna",
        "last_name": "Taylor",
        "phone_number": "+421444555666",
        "gender": "female",
        "hospital_id": 2,  # Reference to hospital ID
    },
    {
        "id": 8,
        "first_name": "James",
        "last_name": "Anderson",
        "phone_number": "+421333444555",
        "gender": "male",
        "hospital_id": 2,  # Reference to hospital ID
    },
]

PATIENTS = [
    {
        "id": 101,
        "first_name": "Patient",  # Updated first name
        "last_name": "Smith",  # Last name remains consistent
        "phone_number": "+421987654321",
        "birth_date": "1990-05-15",
        "birth_number": "9005151234",
        "gender": "female",
        "doctor_id": 1,  # Reference to doctor ID
        "hospital_id": 1,  # Reference to hospital ID
        "images": [201],  # References to image IDs
    },
    {
        "id": 102,
        "first_name": "Bob",
        "last_name": "Johnson",
        "phone_number": "+421987654322",
        "birth_date": "1985-08-20",
        "birth_number": "8508205678",
        "gender": "male",
        "doctor_id": 2,  # Reference to doctor ID
        "hospital_id": 1,  # Reference to hospital ID
        "images": [202],  # References to image IDs
    },
    {
        "id": 201,
        "first_name": "Liam",
        "last_name": "Smith",
        "phone_number": "+421222333444",
        "birth_date": "1980-01-15",
        "birth_number": "8001151234",
        "gender": "male",
        "doctor_id": 4,  # Reference to doctor ID
        "hospital_id": 2,  # Reference to hospital ID
        "images": [301, 302],  # References to image IDs
    },
    {
        "id": 202,
        "first_name": "Olivia",
        "last_name": "Jones",
        "phone_number": "+421111222333",
        "birth_date": "1995-03-20",
        "birth_number": "9503205678",
        "gender": "female",
        "doctor_id": 5,  # Reference to doctor ID
        "hospital_id": 2,  # Reference to hospital ID
        "images": [303],  # References to image IDs
    },
    {
        "id": 203,
        "first_name": "Noah",
        "last_name": "Taylor",
        "phone_number": "+421999888777",
        "birth_date": "1988-07-10",
        "birth_number": "8807103456",
        "gender": "male",
        "doctor_id": 6,  # Reference to doctor ID
        "hospital_id": 2,  # Reference to hospital ID
        "images": [304],  # References to image IDs
    },
    {
        "id": 204,
        "first_name": "Emma",
        "last_name": "Davis",
        "phone_number": "+421777666555",
        "birth_date": "1992-11-25",
        "birth_number": "9211257890",
        "gender": "female",
        "doctor_id": 4,  # Reference to doctor ID
        "hospital_id": 2,  # Reference to hospital ID
        "images": [305],  # References to image IDs
    },
    {
        "id": 205,
        "first_name": "Sophia",
        "last_name": "Martinez",
        "phone_number": "+421666555444",
        "birth_date": "2000-05-30",
        "birth_number": "0005301234",
        "gender": "female",
        "doctor_id": 5,  # Reference to doctor ID
        "hospital_id": 2,  # Reference to hospital ID
        "images": [306, 307],  # References to image IDs
    },
    {
        "id": 103,
        "first_name": "Patient",
        "last_name": "Taylor",
        "phone_number": "+421123456789",
        "birth_date": "1992-06-15",
        "birth_number": "9206151234",
        "gender": "female",
        "doctor_id": 1,  # Reference to doctor ID
        "hospital_id": 1,  # Reference to hospital ID
        "images": [203],  # References to image IDs
    },
    {
        "id": 104,
        "first_name": "Patient",
        "last_name": "Brown",
        "phone_number": "+421987654320",
        "birth_date": "1987-03-10",
        "birth_number": "8703105678",
        "gender": "male",
        "doctor_id": 2,  # Reference to doctor ID
        "hospital_id": 1,  # Reference to hospital ID
        "images": [204],  # References to image IDs
    },
    {
        "id": 105,
        "first_name": "Patient",
        "last_name": "Davis",
        "phone_number": "+421555666777",
        "birth_date": "1995-11-25",
        "birth_number": "9511257890",
        "gender": "female",
        "doctor_id": 1,  # Reference to doctor ID
        "hospital_id": 1,  # Reference to hospital ID
        "images": [205],  # References to image IDs
    },
    {
        "id": 106,
        "first_name": "Patient",
        "last_name": "Martinez",
        "phone_number": "+421666555444",
        "birth_date": "1990-05-30",
        "birth_number": "9005301234",
        "gender": "female",
        "doctor_id": 2,  # Reference to doctor ID
        "hospital_id": 1,  # Reference to hospital ID
        "images": [206],  # References to image IDs
    },
    {
        "id": 107,
        "first_name": "Patient",
        "last_name": "Wilson",
        "phone_number": "+421444555666",
        "birth_date": "1988-07-10",
        "birth_number": "8807103456",
        "gender": "male",
        "doctor_id": 1,  # Reference to doctor ID
        "hospital_id": 1,  # Reference to hospital ID
        "images": [207],  # References to image IDs
    },
    {
        "id": 108,
        "first_name": "Patient",
        "last_name": "Moore",
        "phone_number": "+421333444555",
        "birth_date": "1993-02-20",
        "birth_number": "9302205678",
        "gender": "female",
        "doctor_id": 2,  # Reference to doctor ID
        "hospital_id": 1,  # Reference to hospital ID
        "images": [208],  # References to image IDs
    },
    {
        "id": 109,
        "first_name": "Patient",
        "last_name": "Taylor",
        "phone_number": "+421222333444",
        "birth_date": "1991-01-15",
        "birth_number": "9101151234",
        "gender": "male",
        "doctor_id": 1,  # Reference to doctor ID
        "hospital_id": 1,  # Reference to hospital ID
        "images": [209],  # References to image IDs
    },
    {
        "id": 110,
        "first_name": "Patient",
        "last_name": "Anderson",
        "phone_number": "+421111222333",
        "birth_date": "1994-03-20",
        "birth_number": "9403205678",
        "gender": "female",
        "doctor_id": 2,  # Reference to doctor ID
        "hospital_id": 1,  # Reference to hospital ID
        "images": [210],  # References to image IDs
    },
]

IMAGES = [
    {
        "id": 201,
        "original_image_path": "images/Untitled.jpg",
        "quality": "good",
        "created_at": "2023-04-01T12:00:00Z",
        "eye_side": "prave",
        "diagnosis": "Glaucoma",
        "patient_id": 101,
        "processed_images": [],
        "name": "Smith_201_R_00_12_12_01_04_2023",
        "device_type": "OCT Scanner",
        "camera_type": "Canon EOS 5D",
        "methods": ["Segmentation", "Classification"],
    },
    {
        "id": 202,
        "original_image_path": "images/Untitled.jpg",
        "quality": "good",
        "created_at": "2023-04-02T14:30:00Z",
        "eye_side": "lave",
        "diagnosis": "Cataract",
        "patient_id": 102,
        "processed_images": [],
        "name": "Johnson_202_L_00_30_14_02_04_2023",
        "device_type": "Fundus Camera",
        "camera_type": "Nikon D850",
        "methods": ["Detection"],
    },
    {
        "id": 301,
        "original_image_path": "images/Untitled.jpg",
        "quality": "good",
        "created_at": "2023-04-01T12:00:00Z",
        "eye_side": "prave",
        "diagnosis": "Healthy",
        "patient_id": 201,
        "processed_images": [401, 402],
        "name": "Smith_301_R_00_12_12_01_04_2023",
        "device_type": "OCT Scanner",
        "camera_type": "Sony Alpha 7R",
        "methods": ["Segmentation", "Experimental Method A"],
    },
    {
        "id": 302,
        "original_image_path": "images/Untitled.jpg",
        "quality": "good",
        "created_at": "2023-04-02T14:30:00Z",
        "eye_side": "lave",
        "diagnosis": "Healthy",
        "patient_id": 201,
        "processed_images": [402],
        "name": "Smith_302_L_00_30_14_02_04_2023",
        "device_type": "Fundus Camera",
        "camera_type": "Canon EOS 90D",
        "methods": ["Classification"],
    },
    {
        "id": 303,
        "original_image_path": "images/Untitled.jpg",
        "quality": "good",
        "created_at": "2023-04-03T10:00:00Z",
        "eye_side": "prave",
        "diagnosis": "Cataract",
        "patient_id": 202,
        "processed_images": [403],
        "name": "Jones_303_R_00_10_10_03_04_2023",
        "device_type": "OCT Scanner",
        "camera_type": "Sony Alpha 7 III",
        "methods": ["Detection", "Experimental Method B"],
    },
    {
        "id": 304,
        "original_image_path": "images/Untitled.jpg",
        "quality": "good",
        "created_at": "2023-04-04T09:00:00Z",
        "eye_side": "prave",
        "diagnosis": "Glaucoma",
        "patient_id": 203,
        "processed_images": [404],
        "name": "Taylor_304_R_00_09_09_04_04_2023",
        "device_type": "Fundus Camera",
        "camera_type": "Nikon Z6",
        "methods": ["Segmentation"],
    },
    {
        "id": 305,
        "original_image_path": "images/Untitled.jpg",
        "quality": "good",
        "created_at": "2023-04-05T08:00:00Z",
        "eye_side": "lave",
        "diagnosis": "Healthy",
        "patient_id": 204,
        "processed_images": [405],
        "name": "Davis_305_L_00_08_08_05_04_2023",
        "device_type": "OCT Scanner",
        "camera_type": "Canon EOS R5",
        "methods": ["Classification"],
    },
    {
        "id": 306,
        "original_image_path": "images/Untitled.jpg",
        "quality": "good",
        "created_at": "2023-04-06T11:00:00Z",
        "eye_side": "prave",
        "diagnosis": "Cataract",
        "patient_id": 205,
        "processed_images": [406],
        "name": "Martinez_306_R_00_11_11_06_04_2023",
        "device_type": "Fundus Camera",
        "camera_type": "Sony Alpha 7 IV",
        "methods": ["Detection"],
    },
    {
        "id": 307,
        "original_image_path": "images/Untitled.jpg",
        "quality": "good",
        "created_at": "2023-04-07T13:00:00Z",
        "eye_side": "lave",
        "diagnosis": "Cataract",
        "patient_id": 205,
        "processed_images": [407],
        "name": "Martinez_307_L_00_13_13_07_04_2023",
        "device_type": "OCT Scanner",
        "camera_type": "Nikon D750",
        "methods": ["Segmentation", "Experimental Method A"],
    },
    {
        "id": 203,
        "original_image_path": "images/Untitled.jpg",
        "quality": "good",
        "created_at": "2023-04-08T10:00:00Z",
        "eye_side": "lave",
        "diagnosis": "Healthy",
        "patient_id": 103,
        "processed_images": [503],
        "name": "Taylor_203_L_00_10_10_08_04_2023",
        "device_type": "Fundus Camera",
        "camera_type": "Canon EOS 6D",
        "methods": ["Classification"],
    },
    {
        "id": 204,
        "original_image_path": "images/Untitled.jpg",
        "quality": "good",
        "created_at": "2023-04-09T11:00:00Z",
        "eye_side": "lave",
        "diagnosis": "Cataract",
        "patient_id": 104,
        "processed_images": [504],
        "name": "Brown_204_L_00_11_11_09_04_2023",
        "device_type": "OCT Scanner",
        "camera_type": "Sony Alpha 7C",
        "methods": ["Detection"],
    },
    {
        "id": 205,
        "original_image_path": "images/Untitled.jpg",
        "quality": "good",
        "created_at": "2023-04-10T12:00:00Z",
        "eye_side": "prave",
        "diagnosis": "Glaucoma",
        "patient_id": 105,
        "processed_images": [505],
        "name": "Davis_205_R_00_12_12_10_04_2023",
        "device_type": "Fundus Camera",
        "camera_type": "Nikon Z7",
        "methods": ["Segmentation"],
    },
    {
        "id": 206,
        "original_image_path": "images/Untitled.jpg",
        "quality": "good",
        "created_at": "2023-04-11T13:00:00Z",
        "eye_side": "lave",
        "diagnosis": "Healthy",
        "patient_id": 106,
        "processed_images": [506],
        "name": "Martinez_206_L_00_13_13_11_04_2023",
        "device_type": "OCT Scanner",
        "camera_type": "Canon EOS RP",
        "methods": ["Classification"],
    },
    {
        "id": 207,
        "original_image_path": "images/Untitled.jpg",
        "quality": "good",
        "created_at": "2023-04-12T14:00:00Z",
        "eye_side": "prave",
        "diagnosis": "Cataract",
        "patient_id": 107,
        "processed_images": [507],
        "name": "Wilson_207_R_00_14_14_12_04_2023",
        "device_type": "Fundus Camera",
        "camera_type": "Sony Alpha 7S III",
        "methods": ["Detection"],
    },
    {
        "id": 208,
        "original_image_path": "images/Untitled.jpg",
        "quality": "good",
        "created_at": "2023-04-13T15:00:00Z",
        "eye_side": "lave",
        "diagnosis": "Glaucoma",
        "patient_id": 108,
        "processed_images": [508],
        "name": "Moore_208_L_00_15_15_13_04_2023",
        "device_type": "OCT Scanner",
        "camera_type": "Nikon D780",
        "methods": ["Segmentation"],
    },
    {
        "id": 209,
        "original_image_path": "images/Untitled.jpg",
        "quality": "good",
        "created_at": "2023-04-14T16:00:00Z",
        "eye_side": "prave",
        "diagnosis": "Healthy",
        "patient_id": 109,
        "processed_images": [509],
        "name": "Taylor_209_R_00_16_16_14_04_2023",
        "device_type": "Fundus Camera",
        "camera_type": "Canon EOS 5D Mark IV",
        "methods": ["Classification"],
    },
    {
        "id": 210,
        "original_image_path": "images/Untitled.jpg",
        "quality": "good",
        "created_at": "2023-04-15T17:00:00Z",
        "eye_side": "lave",
        "diagnosis": "Cataract",
        "patient_id": 110,
        "processed_images": [510],
        "name": "Anderson_210_L_00_17_17_15_04_2023",
        "device_type": "OCT Scanner",
        "camera_type": "Sony Alpha 7 IV",
        "methods": ["Detection"],
    },
]

PROCESSED_IMAGES = [
    {
        "id": 401,
        "created_at": "2023-04-08T10:00:00Z",
        "status": "completed",
        "technical_notes": "Processed with high accuracy.",
        "diagnostic_notes": "Detected early signs of glaucoma.",
        "process_type": {
            "id": 1,
            "name": "Segmentation",
            "description": "Segmentation of retinal layers.",
        },
        "processed_image_path": "images/OIP.jpg",
        "segmentation_mask_path": "images/mask.jpg",
        "bounding_boxes_path": "images/box.jpg",
        "answer": {
            "glaucoma_probability": 0.85,
            "retinal_thickness": 250,
        },
        "original_image_id": 301,  # Reference to original image ID
    },
    {
        "id": 402,
        "created_at": "2023-04-08T12:00:00Z",
        "status": "completed",
        "technical_notes": "Processed with high accuracy.",
        "diagnostic_notes": "No significant findings.",
        "process_type": {
            "id": 2,
            "name": "Classification",
            "description": "Classification of retinal conditions.",
        },
        "processed_image_path": "images/OIP.jpg",
        "segmentation_mask_path": None,
        "bounding_boxes_path": None,
        "answer": {
            "classification": "Healthy",
        },
        "original_image_id": 302,  # Reference to original image ID
    },
    {
        "id": 403,
        "created_at": "2023-04-09T09:00:00Z",
        "status": "completed",
        "technical_notes": "Processed with high accuracy.",
        "diagnostic_notes": "Detected cataract.",
        "process_type": {
            "id": 1,
            "name": "Segmentation",
            "description": "Segmentation of retinal layers.",
        },
        "processed_image_path": "images/OIP.jpg",
        "segmentation_mask_path": "images/mask.jpg",
        "bounding_boxes_path": None,
        "answer": {
            "cataract_probability": 0.92,
        },
        "original_image_id": 303,  # Reference to original image ID
    },
    {
        "id": 404,
        "created_at": "2023-04-10T11:00:00Z",
        "status": "completed",
        "technical_notes": "Processed with high accuracy.",
        "diagnostic_notes": "Detected glaucoma.",
        "process_type": {
            "id": 1,
            "name": "Segmentation",
            "description": "Segmentation of retinal layers.",
        },
        "processed_image_path": "images/OIP.jpg",
        "segmentation_mask_path": "images/mask.jpg",
        "bounding_boxes_path": None,
        "answer": {
            "glaucoma_probability": 0.88,
        },
        "original_image_id": 304,  # Reference to original image ID
    },
    {
        "id": 405,
        "created_at": "2023-04-11T08:00:00Z",
        "status": "completed",
        "technical_notes": "Processed with high accuracy.",
        "diagnostic_notes": "No significant findings.",
        "process_type": {
            "id": 2,
            "name": "Classification",
            "description": "Classification of retinal conditions.",
        },
        "processed_image_path": "images/OIP.jpg",
        "segmentation_mask_path": None,
        "bounding_boxes_path": None,
        "answer": {
            "classification": "Healthy",
        },
        "original_image_id": 305,  # Reference to original image ID
    },
    {
        "id": 406,
        "created_at": "2023-04-12T10:00:00Z",
        "status": "completed",
        "technical_notes": "Processed with high accuracy.",
        "diagnostic_notes": "Detected cataract.",
        "process_type": {
            "id": 1,
            "name": "Segmentation",
            "description": "Segmentation of retinal layers.",
        },
        "processed_image_path": "images/OIP.jpg",
        "segmentation_mask_path": "images/mask.jpg",
        "bounding_boxes_path": None,
        "answer": {
            "cataract_probability": 0.95,
        },
        "original_image_id": 306,  # Reference to original image ID
    },
    {
        "id": 407,
        "created_at": "2023-04-12T12:00:00Z",
        "status": "completed",
        "technical_notes": "Processed with high accuracy.",
        "diagnostic_notes": "Detected cataract.",
        "process_type": {
            "id": 1,
            "name": "Segmentation",
            "description": "Segmentation of retinal layers.",
        },
        "processed_image_path": "images/OIP.jpg",
        "segmentation_mask_path": "images/mask.jpg",
        "bounding_boxes_path": None,
        "answer": {
            "cataract_probability": 0.93,
        },
        "original_image_id": 307,  # Reference to original image ID
    },
    {
        "id": 503,
        "created_at": "2023-04-08T11:00:00Z",
        "status": "completed",
        "technical_notes": "Processed with high accuracy.",
        "diagnostic_notes": "No significant findings.",
        "process_type": {
            "id": 2,
            "name": "Classification",
            "description": "Classification of retinal conditions.",
        },
        "processed_image_path": "images/OIP.jpg",
        "segmentation_mask_path": None,
        "bounding_boxes_path": None,
        "answer": {
            "classification": "Healthy",
        },
        "original_image_id": 203,  # Reference to original image ID
    },
    {
        "id": 504,
        "created_at": "2023-04-09T12:00:00Z",
        "status": "completed",
        "technical_notes": "Processed with high accuracy.",
        "diagnostic_notes": "Detected cataract.",
        "process_type": {
            "id": 1,
            "name": "Segmentation",
            "description": "Segmentation of retinal layers.",
        },
        "processed_image_path": "images/OIP.jpg",
        "segmentation_mask_path": "images/mask.jpg",
        "bounding_boxes_path": None,
        "answer": {
            "cataract_probability": 0.92,
        },
        "original_image_id": 204,  # Reference to original image ID
    },
    {
        "id": 505,
        "created_at": "2023-04-10T12:00:00Z",
        "status": "completed",
        "technical_notes": "Processed with high accuracy.",
        "diagnostic_notes": "Detected glaucoma.",
        "process_type": {
            "id": 1,
            "name": "Segmentation",
            "description": "Segmentation of retinal layers.",
        },
        "processed_image_path": "images/OIP.jpg",
        "segmentation_mask_path": "images/mask.jpg",
        "bounding_boxes_path": None,
        "answer": {
            "glaucoma_probability": 0.88,
        },
        "original_image_id": 205,  # Reference to original image ID
    },
    {
        "id": 506,
        "created_at": "2023-04-11T13:00:00Z",
        "status": "completed",
        "technical_notes": "Processed with high accuracy.",
        "diagnostic_notes": "No significant findings.",
        "process_type": {
            "id": 2,
            "name": "Classification",
            "description": "Classification of retinal conditions.",
        },
        "processed_image_path": "images/OIP.jpg",
        "segmentation_mask_path": None,
        "bounding_boxes_path": None,
        "answer": {
            "classification": "Healthy",
        },
        "original_image_id": 206,  # Reference to original image ID
    },
    {
        "id": 507,
        "created_at": "2023-04-12T14:00:00Z",
        "status": "completed",
        "technical_notes": "Processed with high accuracy.",
        "diagnostic_notes": "Detected cataract.",
        "process_type": {
            "id": 1,
            "name": "Segmentation",
            "description": "Segmentation of retinal layers.",
        },
        "processed_image_path": "images/OIP.jpg",
        "segmentation_mask_path": "images/mask.jpg",
        "bounding_boxes_path": None,
        "answer": {
            "cataract_probability": 0.92,
        },
        "original_image_id": 207,  # Reference to original image ID
    },
    {
        "id": 508,
        "created_at": "2023-04-13T15:00:00Z",
        "status": "completed",
        "technical_notes": "Processed with high accuracy.",
        "diagnostic_notes": "Detected glaucoma.",
        "process_type": {
            "id": 1,
            "name": "Segmentation",
            "description": "Segmentation of retinal layers.",
        },
        "processed_image_path": "images/OIP.jpg",
        "segmentation_mask_path": "images/mask.jpg",
        "bounding_boxes_path": None,
        "answer": {
            "glaucoma_probability": 0.88,
        },
        "original_image_id": 208,  # Reference to original image ID
    },
    {
        "id": 509,
        "created_at": "2023-04-14T16:00:00Z",
        "status": "completed",
        "technical_notes": "Processed with high accuracy.",
        "diagnostic_notes": "No significant findings.",
        "process_type": {
            "id": 2,
            "name": "Classification",
            "description": "Classification of retinal conditions.",
        },
        "processed_image_path": "images/OIP.jpg",
        "segmentation_mask_path": None,
        "bounding_boxes_path": None,
        "answer": {
            "classification": "Healthy",
        },
        "original_image_id": 209,  # Reference to original image ID
    },
    {
        "id": 510,
        "created_at": "2023-04-15T17:00:00Z",
        "status": "completed",
        "technical_notes": "Processed with high accuracy.",
        "diagnostic_notes": "Detected cataract.",
        "process_type": {
            "id": 1,
            "name": "Segmentation",
            "description": "Segmentation of retinal layers.",
        },
        "processed_image_path": "images/box.jpg",
        "segmentation_mask_path": "images/mask.jpg",
        "bounding_boxes_path": None,
        "answer": {
            "cataract_probability": 0.92,
        },
        "original_image_id": 210,  # Reference to original image ID
    },
]

MEDICAL_METHODS = [
    {
        "id": 1,
        "name": "Segmentation",
        "description": "Segmentation of medical images to identify regions of interest.",
        "created_at": "2023-04-01T12:00:00",  # Example timestamp
    },
    {
        "id": 2,
        "name": "Classification",
        "description": "Classification of medical conditions based on image data.",
        "created_at": "2023-04-02T14:30:00",  # Example timestamp
    },
    {
        "id": 3,
        "name": "Detection",
        "description": "Detection of anomalies in medical images.",
        "created_at": "2023-04-03T10:00:00",  # Example timestamp
    },
    {
        "id": 4,
        "name": "Experimental Method A",
        "description": "An experimental method for testing new diagnostic techniques.",
        "created_at": "2023-04-04T09:00:00",  # Example timestamp
    },
    {
        "id": 5,
        "name": "Experimental Method B",
        "description": "Another experimental method for advanced diagnostics.",
        "created_at": "2023-04-05T08:00:00",  # Example timestamp
    },
]

DOCTOR_USER_DATA = {
    "id": 1,
    "email": "doctor.doe@example.com",
    "password_hash": "pbkdf2:sha256:150000$doctorhash",
    "created_at": "2023-01-01T12:00:00Z",
    "user_type": "doctor",
    "first_name": "Doctor",
    "last_name": "Doe",
    "phone_number": "+421123456789",
    "gender": "male",
    "title": "Dr.",
    "suffix": "PhD",
    "super_doctor": True,
    "hospital_id": 1,
    "patients": [101],
    "created_images": [201, 202],
}

SUPER_ADMIN_USER_DATA = {
    "id": 1,
    "email": "super.admin.johnson@example.com",
    "password_hash": "pbkdf2:sha256:150000$adminhash",
    "created_at": "2025-01-01",
    "user_type": "super_admin",
    "first_name": "Super Admin",
    "last_name": "Johnson",
    "phone_number": "+421987654321",
    "gender": "female",
    "hospital_id": [2, 1],  # Super admin manages multiple hospitals
}

ADMIN_USER_DATA = {
    "id": 3,
    "email": "admin.clark@example.com",
    "password_hash": "pbkdf2:sha256:150000$adminhash",
    "created_at": "2025-02-01",
    "user_type": "admin",
    "first_name": "Admin",
    "last_name": "Clark",
    "phone_number": "+421987654322",
    "gender": "female",
    "hospital_id": 2,
}

PATIENT_USER_DATA = {
    "id": 101,
    "email": "patient.smith@example.com",
    "password_hash": "pbkdf2:sha256:150000$patienthash",
    "created_at": "2023-03-01T15:00:00Z",
    "user_type": "patient",
    "first_name": "Patient",
    "last_name": "Smith",
    "phone_number": "+421987654321",
    "birth_date": "1990-05-15",
    "birth_number": "9005151234",
    "gender": "female",
    "doctor_id": 1,
    "hospital_id": 1,
    "images": [201],
}

TECHNICIAN_USER_DATA = {
    "id": 1,
    "email": "technician.brown@example.com",
    "password_hash": "pbkdf2:sha256:150000$technicianhash",
    "created_at": "2023-04-01T08:00:00Z",
    "user_type": "technician",
    "first_name": "Technician",
    "last_name": "Brown",
    "phone_number": "+421555666777",
    "gender": "female",
    "hospital_id": 1,
}

