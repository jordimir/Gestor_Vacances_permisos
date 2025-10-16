import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const usersCollection = db.collection("users");

const app = express();
app.use(cors({origin: true}));
app.use(express.json());

// --- API Routes ---

// GET all user profiles
app.get("/api/users", async (req, res) => {
  try {
    const snapshot = await usersCollection.get();
    const users: any[] = [];
    snapshot.forEach((doc) => {
      const {leaveDays, leaveTypes, workDays, ...profile} = doc.data();
      users.push(profile);
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({error: "Something went wrong"});
  }
});

// GET all user data (leave days, types, etc.)
app.get("/api/usersdata", async (req, res) => {
  try {
    const snapshot = await usersCollection.get();
    const allData: Record<string, any> = {};
    snapshot.forEach((doc) => {
      const {leaveDays, leaveTypes, workDays} = doc.data();
      allData[doc.id] = {
        leaveDays: leaveDays || {},
        leaveTypes: leaveTypes || {},
        workDays: workDays || [true, true, true, true, true, false, false],
      };
    });
    return res.status(200).json(allData);
  } catch (error) {
    return res.status(500).json({error: "Something went wrong"});
  }
});


// CREATE a new user
app.post("/api/users", async (req, res) => {
  try {
    const newUserProfile = req.body;
    const docRef = usersCollection.doc();
    const userWithId = {...newUserProfile, id: docRef.id};

    await docRef.set(userWithId);

    return res.status(201).json(userWithId);
  } catch (error) {
    return res.status(500).json({error: "Failed to create user"});
  }
});

// DELETE a user
app.delete("/api/users/:userId", async (req, res) => {
  try {
    const {userId} = req.params;
    await usersCollection.doc(userId).delete();
    return res.status(200).json({success: true});
  } catch (error) {
    return res.status(500).json({error: "Failed to delete user"});
  }
});

// UPDATE a user's data
app.put("/api/users/:userId/data", async (req, res) => {
  try {
    const {userId} = req.params;
    const userData = req.body;
    await usersCollection.doc(userId).set(userData, {merge: true});
    return res.status(200).json({success: true});
  } catch (error) {
    return res.status(500).json({error: "Failed to update user data"});
  }
});

// Export the API to Firebase Functions
export const api = functions.https.onRequest(app);
