import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const usersCollection = db.collection("users");

// --- Helper functions and constants for user initialization ---

const calculateVacationDays = (hireDate: string): number => {
    const baseVacationDays = 22;
    const today = new Date();
    const startDate = new Date(hireDate);

    let yearsOfService = today.getFullYear() - startDate.getFullYear();
    const monthDifference = today.getMonth() - startDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < startDate.getDate())) {
        yearsOfService--;
    }

    let additionalDays = 0;
    if (yearsOfService >= 35) {
        additionalDays = 5;
    } else if (yearsOfService >= 30) {
        additionalDays = 4;
    } else if (yearsOfService >= 25) {
        additionalDays = 3;
    } else if (yearsOfService >= 20) {
        additionalDays = 2;
    } else if (yearsOfService >= 15) {
        additionalDays = 1;
    }

    return baseVacationDays + additionalDays;
};

const calculatePersonalLeaveDays = (hireDate: string): number => {
    const basePersonalLeaveDays = 6;
    const today = new Date();
    const startDate = new Date(hireDate);

    let yearsOfService = today.getFullYear() - startDate.getFullYear();
    const m = today.getMonth() - startDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < startDate.getDate())) {
        yearsOfService--;
    }

    const triennials = Math.floor(yearsOfService / 3);

    let additionalDays = 0;
    if (triennials >= 8) {
        additionalDays = 2 + (triennials - 7);
    } else if (triennials >= 6) {
        additionalDays = 2;
    }

    return basePersonalLeaveDays + additionalDays;
};

const DEFAULT_LEAVE_TYPES = {
    "VACANCES": {label: "Vacances", color: "bg-blue-500", textColor: "text-white", total: 22},
    "ASSUMPTES_PROPIS": {label: "Assumptes Personals", color: "bg-green-500", textColor: "text-white", total: 6},
    "PONT": {label: "Pont", color: "bg-yellow-500", textColor: "text-gray-800", total: 2},
    "BAIXA_MEDICA": {label: "Baixa Mèdica", color: "bg-red-500", textColor: "text-white", total: 0},
    "ALTRES": {label: "Altres", color: "bg-purple-500", textColor: "text-white", total: 0},
};


const app = express();
app.use(cors({origin: true}));
app.use(express.json());

// --- API Routes ---

// GET all user profiles
app.get("/users", async (req, res) => {
  try {
    const snapshot = await usersCollection.get();
    const users: any[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {leaveDays, leaveTypes, workDays, ...profile} = data;
        users.push(profile);
      }
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    return res.status(500).json({error: "Something went wrong fetching users."});
  }
});

// GET all user data (leave days, types, etc.)
app.get("/usersdata", async (req, res) => {
  try {
    const snapshot = await usersCollection.get();
    const allData: Record<string, any> = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data) {
        const {leaveDays, leaveTypes, workDays} = data;
        allData[doc.id] = {
          leaveDays: leaveDays || {},
          leaveTypes: leaveTypes || {},
          workDays: workDays || [true, true, true, true, true, false, false],
        };
      }
    });
    return res.status(200).json(allData);
  } catch (error) {
    console.error("Error getting user data:", error);
    return res.status(500).json({error: "Something went wrong fetching user data."});
  }
});


// CREATE a new user
app.post("/users", async (req, res) => {
  try {
    const newUserProfile = req.body;
    if (
      !newUserProfile.name ||
      !newUserProfile.dni ||
      !newUserProfile.department ||
      !newUserProfile.hireDate
    ) {
      return res.status(400)
        .json({error: "Missing required fields: name, dni, department, hireDate."});
    }

    // Generate initial user data
    const initialLeaveTypes = JSON.parse(JSON.stringify(DEFAULT_LEAVE_TYPES));
    initialLeaveTypes["VACANCES"].total = calculateVacationDays(newUserProfile.hireDate);
    initialLeaveTypes["ASSUMPTES_PROPIS"].total = calculatePersonalLeaveDays(newUserProfile.hireDate);

    const initialUserData = {
        leaveDays: {},
        leaveTypes: initialLeaveTypes,
        workDays: [true, true, true, true, true, false, false],
    };

    const docRef = usersCollection.doc();
    const fullUserDocument = {
        ...newUserProfile,
        id: docRef.id,
        ...initialUserData,
    };

    await docRef.set(fullUserDocument);

    // Return only the profile part to the client, as expected
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {leaveDays, leaveTypes, workDays, ...profile} = fullUserDocument;
    return res.status(201).json(profile);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({error: "Failed to create user."});
  }
});

// DELETE a user
app.delete("/users/:userId", async (req, res) => {
  try {
    const {userId} = req.params;
    if (!userId) {
        return res.status(400).json({error: "User ID is required."});
    }
    await usersCollection.doc(userId).delete();
    return res.status(200).json({success: true});
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({error: "Failed to delete user."});
  }
});

// UPDATE a user's data
app.put("/users/:userId/data", async (req, res) => {
  try {
    const {userId} = req.params;
    const userData = req.body;

    if (!userId) {
        return res.status(400).json({error: "User ID is required."});
    }

    if (
        !userData ||
        typeof userData.leaveDays === "undefined" ||
        typeof userData.leaveTypes === "undefined" ||
        typeof userData.workDays === "undefined"
    ) {
        return res.status(400).json({error: "Invalid user data structure provided."});
    }

    await usersCollection.doc(userId).set(userData, {merge: true});
    return res.status(200).json({success: true});
  } catch (error) {
    console.error("Error updating user data:", error);
    return res.status(500).json({error: "Failed to update user data."});
  }
});

// Export the API to Firebase Functions
export const api = functions.https.onRequest(app);