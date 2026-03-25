
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  addDoc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../services/firebaseService';
import { UserAccount, MerchantAccount, Transaction } from '../types';

export class PiggyRepository {
  private static COLLECTIONS = {
    USERS: 'users',
    MERCHANTS: 'merchants',
    TRANSACTIONS: 'transactions'
  };

  // --- LISTENERS (Tiempo Real) ---
  
  /**
   * Escucha cambios en el usuario (saldo, nivel, meta)
   */
  static subscribeToUser(userId: string, callback: (user: UserAccount) => void) {
    const userRef = doc(db, this.COLLECTIONS.USERS, userId);
    return onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as UserAccount);
      }
    });
  }

  /**
   * Escucha nuevas transacciones en tiempo real
   */
  static subscribeToTransactions(callback: (txs: Transaction[]) => void) {
    const txCol = collection(db, this.COLLECTIONS.TRANSACTIONS);
    const q = query(txCol, orderBy('timestamp', 'desc'), limit(30));
    
    return onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => doc.data() as Transaction);
      callback(txs);
    });
  }

  // --- MÉTODOS ASÍNCRONOS ---

  // Fix for Error in file components/UserView.tsx: Property 'getTransactions' does not exist
  static async getTransactions(): Promise<Transaction[]> {
    const txCol = collection(db, this.COLLECTIONS.TRANSACTIONS);
    const q = query(txCol, orderBy('timestamp', 'desc'), limit(30));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Transaction);
  }

  static async getUser(userId: string = 'valen-001'): Promise<UserAccount> {
    const userRef = doc(db, this.COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) return userSnap.data() as UserAccount;
    
    const defaultUser: UserAccount = {
      id: userId, phone: '3001234567', balance: 45350, xp: 650, level: 2, 
      goalName: 'Tenis Nike Air', goalTarget: 70000, lastYield: 5
    };
    await setDoc(userRef, defaultUser);
    return defaultUser;
  }

  static async updateUser(user: UserAccount): Promise<void> {
    const userRef = doc(db, this.COLLECTIONS.USERS, user.id);
    await setDoc(userRef, user, { merge: true });
  }

  static async getMerchants(): Promise<MerchantAccount[]> {
    const merchantsCol = collection(db, this.COLLECTIONS.MERCHANTS);
    const snapshot = await getDocs(merchantsCol);
    return snapshot.docs.map(doc => doc.data() as MerchantAccount);
  }

  static async updateMerchant(merchant: MerchantAccount): Promise<void> {
    const merchantRef = doc(db, this.COLLECTIONS.MERCHANTS, merchant.id);
    await setDoc(merchantRef, merchant, { merge: true });
  }

  static async processTopUp(amount: number, txId: string, reference: string, userId: string = 'valen-001'): Promise<void> {
    const user = await this.getUser(userId);
    user.balance += amount;
    user.xp += 100;
    
    await this.updateUser(user);
    await this.addTransaction({
      id: txId,
      type: 'YIELD',
      amount: amount,
      description: 'Recarga Wompi Pay',
      timestamp: new Date().toISOString(),
      status: 'COMPLETADA'
    });
  }

  static async addTransaction(tx: Transaction): Promise<void> {
    const txCol = collection(db, this.COLLECTIONS.TRANSACTIONS);
    await addDoc(txCol, { ...tx, serverTimestamp: Timestamp.now() });
  }
}
