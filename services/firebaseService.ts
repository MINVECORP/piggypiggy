
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

/**
 * PIGGYBANKO FIREBASE CONNECTION
 * 
 * INSTRUCCIONES:
 * 1. Ve a https://console.firebase.google.com/
 * 2. Crea un proyecto llamado "Piggybanko"
 * 3. Añade una "Web App" y copia el objeto firebaseConfig aquí.
 * 4. Habilita "Cloud Firestore" en modo de prueba o producción.
 */
const firebaseConfig = {
  // REEMPLAZA ESTO CON TUS DATOS DE LA CONSOLA DE FIREBASE:
  apiKey: "TU_API_KEY_REAL",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "tu-sender-id",
  appId: "tu-app-id"
};

// Inicialización protegida
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("🔥 Piggybanko Cloud: Conexión establecida");
} catch (error) {
  console.error("❌ Error de configuración Firebase:", error);
}

export { db };
