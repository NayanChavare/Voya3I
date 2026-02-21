import { User, AssessmentResult, Role, AssessmentScores, Question } from '../types';
import { db } from './db';
import { calculateScoresInPython } from './pythonBackend';

const USERS_KEY = 'users';
const RESULTS_KEY = 'results';
const SESSION_KEY = 'current_session';

export const backend = {
  /**
   * Ensures the vault is unsealed before any operation.
   */
  async ensureReady() {
    await db.init();
  },

  // --- AUTHENTICATION ---
  
  async signup(email: string, fullName: string, role: Role, password: string, institution: string): Promise<User> {
    await this.ensureReady();
    const users = db.get<User[]>(USERS_KEY) || [];
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }
    const newUser: User = {
      // FIX: Replaced deprecated `substr` with `slice` for consistency and best practices.
      id: Math.random().toString(36).slice(2, 11),
      email,
      fullName,
      institution,
      role,
      password,
      createdAt: new Date().toISOString()
    };
    await db.set(USERS_KEY, [...users, newUser]);
    await this.createSession(newUser);
    return newUser;
  },

  async login(email: string, password: string): Promise<User> {
    await this.ensureReady();
    const users = db.get<User[]>(USERS_KEY) || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    await this.createSession(user);
    return user;
  },

  async logout(): Promise<void> {
    await this.ensureReady();
    await db.remove(SESSION_KEY);
  },

  async getCurrentUser(): Promise<User | null> {
    await this.ensureReady();
    return db.get<User>(SESSION_KEY);
  },

  async createSession(user: User): Promise<void> {
    const { password, ...safeUser } = user;
    await db.set(SESSION_KEY, safeUser);
  },

  /**
   * Updates an existing user's information.
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    await this.ensureReady();
    const users = db.get<User[]>(USERS_KEY) || [];
    const index = users.findIndex(u => u.id === userId);
    
    let updatedUser: User;
    if (index !== -1) {
      updatedUser = { ...users[index], ...updates };
      users[index] = updatedUser;
      await db.set(USERS_KEY, users);
    } else {
      // Handle transient (guest) sessions
      const currentUser = await this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        updatedUser = { ...currentUser, ...updates };
      } else {
        throw new Error('Identity record not found.');
      }
    }
    
    await this.createSession(updatedUser);
    return updatedUser;
  },

  // --- DATA STORAGE & PYTHON PROCESSING ---

  /**
   * Processes assessment using Python Engine and saves to vault.
   */
  async processAndSaveAssessment(userId: string, dept: string, questions: Question[], answers: Record<number, string>): Promise<AssessmentResult> {
    await this.ensureReady();
    
    // Call Python Backend for scoring
    const scores = await calculateScoresInPython(questions, answers);
    
    const results = db.get<AssessmentResult[]>(RESULTS_KEY) || [];
    const newResult: AssessmentResult = {
      // FIX: Replaced deprecated `substr` with `slice` for consistency and best practices.
      id: Math.random().toString(36).slice(2, 11),
      userId,
      dept,
      scores,
      timestamp: new Date().toISOString()
    };
    await db.set(RESULTS_KEY, [newResult, ...results]);
    return newResult;
  },

  async getHistory(userId: string): Promise<AssessmentResult[]> {
    await this.ensureReady();
    const results = db.get<AssessmentResult[]>(RESULTS_KEY) || [];
    return results.filter(r => r.userId === userId);
  },

  /**
   * Admin: Get all assessment results from the vault.
   */
  async getAllResults(): Promise<AssessmentResult[]> {
    await this.ensureReady();
    return db.get<AssessmentResult[]>(RESULTS_KEY) || [];
  },

  /**
   * Admin: Get all registered users.
   */
  async getAllUsers(): Promise<User[]> {
    await this.ensureReady();
    return db.get<User[]>(USERS_KEY) || [];
  },

  async deleteResult(id: string): Promise<void> {
    await this.ensureReady();
    const results = db.get<AssessmentResult[]>(RESULTS_KEY) || [];
    await db.set(RESULTS_KEY, results.filter(r => r.id !== id));
  }
};
