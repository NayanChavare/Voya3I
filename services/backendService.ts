import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification,
  signInAnonymously,
  User as FirebaseUser
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  deleteDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { auth, db } from '../src/lib/firebase';
import { User, AssessmentResult, Role, Question, AIInsights, AssessmentScores } from '../types';
import { calculateScoresInPython } from './pythonBackend';

const SESSION_KEY = 'current_session';
const GUEST_DATA_KEY = 'guest_assessments';
const GUEST_AI_KEY = 'guest_ai_interactions';

export const backend = {
  // --- AUTHENTICATION ---
  
  async signup(email: string, fullName: string, role: Role, password: string, institution: string, country: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const newUser: User = {
        id: firebaseUser.uid,
        email,
        fullName,
        role,
        institution,
        country,
        createdAt: new Date().toISOString(),
        emailVerified: false,
      };

      // Save user profile to Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), newUser);
      
      // Send verification email
      try {
        await sendEmailVerification(firebaseUser);
        console.log("[AUTH] Verification email sent.");
      } catch (e) {
        console.warn("[AUTH] Failed to send verification email:", e);
      }
      
      await this.createSession(newUser);
      return newUser;
    } catch (error: any) {
      console.error("Signup Error:", error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("This email is already registered. Please try logging in instead.");
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("The email address is not valid.");
      } else if (error.code === 'auth/weak-password') {
        throw new Error("The password is too weak. Please use at least 6 characters.");
      } else if (error.code === 'auth/configuration-not-found') {
        throw new Error("Firebase Authentication is not fully configured. Please enable 'Email/Password' in your Firebase Console under Authentication > Sign-in method.");
      } else if (error.message?.includes('permission-denied') || error.code === 'permission-denied') {
        throw new Error("Firestore permission denied. Please update your Firestore Security Rules in the Firebase Console to allow users to write to the 'users' collection.");
      } else {
        throw new Error(error.message || "An unexpected error occurred during signup.");
      }
    }
  },

  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (!firebaseUser.emailVerified) {
        // Optionally resend verification email
        // await sendEmailVerification(firebaseUser);
        throw new Error("Please verify your email address before logging in. Check your inbox for the verification link.");
      }

      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (!userDoc.exists()) {
        throw new Error("User profile not found in database.");
      }

      const user = userDoc.data() as User;
      await this.createSession(user);
      return user;
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error("Invalid email or password. Please check your credentials.");
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error("Too many failed login attempts. Please try again later.");
      } else {
        throw new Error(error.message || "An unexpected error occurred during login.");
      }
    }
  },

  async logout(): Promise<void> {
    await signOut(auth);
    localStorage.removeItem(SESSION_KEY);
  },

  async guestLogin(): Promise<User> {
    const localId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const guestUser: User = {
      id: localId,
      email: 'guest@session.local',
      fullName: 'Guest User',
      role: 'Guest',
      createdAt: new Date().toISOString(),
      emailVerified: true,
    };
    await this.createSession(guestUser);
    return guestUser;
  },

  async getCurrentUser(): Promise<User | null> {
    // Try local storage first for speed
    const userJson = localStorage.getItem(SESSION_KEY);
    if (userJson) return JSON.parse(userJson);

    // Otherwise check Firebase Auth
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        if (firebaseUser) {
          if (firebaseUser.isAnonymous) {
            const guestUser: User = {
              id: firebaseUser.uid,
              email: 'guest@session.local',
              fullName: 'Guest User',
              role: 'Guest',
              createdAt: new Date().toISOString(),
              emailVerified: true,
            };
            await this.createSession(guestUser);
            resolve(guestUser);
            return;
          }
          if (!firebaseUser.emailVerified) {
            resolve(null);
            return;
          }
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const user = userDoc.data() as User;
            await this.createSession(user);
            resolve(user);
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  },

  async createSession(user: User): Promise<void> {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, updates, { merge: true });
    
    const updatedDoc = await getDoc(userRef);
    const updatedUser = updatedDoc.data() as User;
    await this.createSession(updatedUser);
    return updatedUser;
  },

  // --- DATA STORAGE & AI INTERACTIONS ---

  /**
   * Automatically saves AI interaction to Firestore in the background.
   */
  async saveAiInteraction(userId: string, prompt: string, aiResponse: any): Promise<void> {
    if (userId.startsWith('guest_')) {
      try {
        const localData = JSON.parse(localStorage.getItem(GUEST_AI_KEY) || '[]');
        localData.push({
          userId,
          prompt,
          ai_response: JSON.stringify(aiResponse),
          timestamp: new Date().toISOString()
        });
        localStorage.setItem(GUEST_AI_KEY, JSON.stringify(localData.slice(-50))); // Keep last 50
      } catch (e) {
        console.error("[LOCAL] Failed to save guest AI interaction:", e);
      }
      return;
    }
    try {
      await addDoc(collection(db, "ai_interactions"), {
        userId,
        prompt,
        ai_response: JSON.stringify(aiResponse),
        timestamp: serverTimestamp()
      });
      console.log("[FIREBASE] AI Interaction saved automatically.");
    } catch (error) {
      console.error("[FIREBASE] Failed to save AI interaction:", error);
    }
  },

  /**
   * Processes assessment using Python Engine and saves to Firestore.
   */
  async processAndSaveAssessment(userId: string, dept: string, scores: AssessmentScores, aiInsights?: AIInsights): Promise<AssessmentResult> {
    const assessmentData = {
      userId,
      dept,
      scores,
      institution: 'N/A',
      aiInsights: aiInsights || null,
      timestamp: new Date().toISOString()
    };

    if (userId.startsWith('guest_')) {
      const localId = `local_${Date.now()}`;
      const result = { id: localId, ...assessmentData } as AssessmentResult;
      try {
        const localHistory = JSON.parse(localStorage.getItem(GUEST_DATA_KEY) || '[]');
        localHistory.unshift(result);
        localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(localHistory.slice(0, 100))); // Keep last 100
      } catch (e) {
        console.error("[LOCAL] Failed to save guest assessment:", e);
      }
      return result;
    }

    // Fetch user to get institution (if they exist in users collection)
    let institution = 'N/A';
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        institution = userData.institution || 'N/A';
      }
    } catch (e) {
      console.warn("[FIREBASE] Could not fetch user profile for assessment, using default institution.");
    }
    
    assessmentData.institution = institution;

    try {
      const docRef = await addDoc(collection(db, "assessments"), assessmentData);
      return {
        id: docRef.id,
        ...assessmentData
      } as AssessmentResult;
    } catch (error) {
      console.error("[FIREBASE] Failed to save assessment to cloud:", error);
      // Return local result if cloud save fails
      return {
        id: `local_${Date.now()}`,
        ...assessmentData
      } as AssessmentResult;
    }
  },

  async getHistory(userId: string): Promise<AssessmentResult[]> {
    if (userId.startsWith('guest_')) {
      try {
        const localHistory = JSON.parse(localStorage.getItem(GUEST_DATA_KEY) || '[]');
        return localHistory.filter((r: AssessmentResult) => r.userId === userId);
      } catch (e) {
        return [];
      }
    }
    const q = query(
      collection(db, "assessments"), 
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AssessmentResult));
  },

  /**
   * Admin: Get all assessment results from Firestore.
   */
  async getAllResults(adminId?: string): Promise<AssessmentResult[]> {
    let q = query(collection(db, "assessments"), orderBy("timestamp", "desc"));

    if (adminId) {
      const adminDoc = await getDoc(doc(db, "users", adminId));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data() as User;
        if (adminData.role === "Admin") {
          q = query(
            collection(db, "assessments"), 
            where("institution", "==", adminData.institution),
            orderBy("timestamp", "desc")
          );
        }
      }
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AssessmentResult));
  },

  /**
   * Admin: Get all registered users.
   */
  async getAllUsers(adminId?: string): Promise<User[]> {
    let q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    
    if (adminId) {
      const adminDoc = await getDoc(doc(db, "users", adminId));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data() as User;
        if (adminData.role === "Admin") {
          // Filter by institution if needed, or return all
          q = query(
            collection(db, "users"), 
            where("institution", "==", adminData.institution),
            orderBy("createdAt", "desc")
          );
        }
      }
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as User);
  },

  async adminCreateUser(adminId: string, userData: any): Promise<User> {
    // Note: Creating users in Firebase Auth from client for another user is tricky.
    // Usually requires a Cloud Function. For now, we'll just save to Firestore.
    // In a real app, this would call a secure backend endpoint.
    const newUserRef = doc(collection(db, "users"));
    const newUser = {
      ...userData,
      id: newUserRef.id,
      createdAt: new Date().toISOString()
    };
    await setDoc(newUserRef, newUser);
    return newUser as User;
  },

  async adminUpdateUser(adminId: string, userId: string, updates: any): Promise<User> {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, updates, { merge: true });
    const updatedDoc = await getDoc(userRef);
    return updatedDoc.data() as User;
  },

  async deleteUser(adminId: string, userId: string): Promise<void> {
    try {
      // Cascade delete: assessments and AI interactions for this user
      const assessmentsQuery = query(collection(db, "assessments"), where("userId", "==", userId));
      const assessmentsSnapshot = await getDocs(assessmentsQuery);
      const assessmentDeletes = assessmentsSnapshot.docs.map(d => deleteDoc(d.ref));

      const aiInteractionsQuery = query(collection(db, "ai_interactions"), where("userId", "==", userId));
      const aiSnapshot = await getDocs(aiInteractionsQuery);
      const aiDeletes = aiSnapshot.docs.map(d => deleteDoc(d.ref));

      await Promise.all([...assessmentDeletes, ...aiDeletes]);
      
      // Finally delete the user profile
      await deleteDoc(doc(db, "users", userId));
    } catch (error: any) {
      console.error("Delete User Error:", error);
      throw new Error(error.message || "Failed to delete user.");
    }
  },

  async deleteOwnAccount(userId: string, role: Role, institution: string): Promise<void> {
    try {
      if (role === 'Admin') {
        // Cascade delete: all users and assessments in this institution
        const usersQuery = query(collection(db, "users"), where("institution", "==", institution));
        const usersSnapshot = await getDocs(usersQuery);
        const userDeletes = usersSnapshot.docs.map(d => deleteDoc(d.ref));
        
        const assessmentsQuery = query(collection(db, "assessments"), where("institution", "==", institution));
        const assessmentsSnapshot = await getDocs(assessmentsQuery);
        const assessmentDeletes = assessmentsSnapshot.docs.map(d => deleteDoc(d.ref));

        const aiInteractionsQuery = query(collection(db, "ai_interactions"), where("userId", "==", userId));
        const aiSnapshot = await getDocs(aiInteractionsQuery);
        const aiDeletes = aiSnapshot.docs.map(d => deleteDoc(d.ref));

        await Promise.all([...userDeletes, ...assessmentDeletes, ...aiDeletes]);
      } else {
        // Just delete own profile and assessments
        await deleteDoc(doc(db, "users", userId));
        
        const assessmentsQuery = query(collection(db, "assessments"), where("userId", "==", userId));
        const assessmentsSnapshot = await getDocs(assessmentsQuery);
        const assessmentDeletes = assessmentsSnapshot.docs.map(d => deleteDoc(d.ref));

        const aiInteractionsQuery = query(collection(db, "ai_interactions"), where("userId", "==", userId));
        const aiSnapshot = await getDocs(aiInteractionsQuery);
        const aiDeletes = aiSnapshot.docs.map(d => deleteDoc(d.ref));

        await Promise.all([...assessmentDeletes, ...aiDeletes]);
      }

      // Finally logout and clear session
      await this.logout();
    } catch (error: any) {
      console.error("Delete Account Error:", error);
      throw new Error(error.message || "Failed to delete account.");
    }
  },

  async deleteResult(id: string): Promise<void> {
    if (id.startsWith('local_')) {
      try {
        const localHistory = JSON.parse(localStorage.getItem(GUEST_DATA_KEY) || '[]');
        const filtered = localHistory.filter((r: AssessmentResult) => r.id !== id);
        localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(filtered));
      } catch (e) {
        console.error("[LOCAL] Failed to delete local result:", e);
      }
      return;
    }
    await deleteDoc(doc(db, "assessments", id));
  },

  async resendVerificationEmail(): Promise<void> {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      await sendEmailVerification(firebaseUser);
    } else {
      throw new Error("No user currently logged in to verify.");
    }
  }
};
