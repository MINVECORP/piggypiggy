
/**
 * Piggybanko Wompi Integration Service
 * Configuración oficial para ambiente de producción.
 */

declare var WidgetCheckout: any;
declare var confetti: any;

// Llaves de Wompi - Entorno de Producción activado
export const WOMPI_CONFIG = {
  publicKey: 'pub_prod_9LvzAHhO3YZWWeOfx6kRcZ4RQrDbJYwl', // Llave pública de producción
  privateKey: 'prv_prod_iURvERLr3re2sPGtFPjUN9k6bPzDjyv0', // Llave privada de producción
  eventsSecret: 'prod_events_ImCCVRbpYmtxLElS5DafITvvdXWZmc79', // Secreto de eventos de producción
  integrityKey: 'prod_integrity_NVNROPWdl7e5SbDqRXRb9JURMjLndFee', // Llave de integridad de producción integrada
  currency: 'COP',
};

export interface WompiTransactionResult {
  id: string;
  status: 'APPROVED' | 'DECLINED' | 'ERROR' | 'VOIDED';
  amountInCents: number;
  reference: string;
  paymentMethodType: string;
  paymentMethod: any;
  redirectUrl?: string;
}

export interface WompiConfig {
  amount: number;
  email: string;
  reference: string;
  onSuccess: (result: WompiTransactionResult) => void;
  onError?: (error: any) => void;
  onClose?: () => void;
}

export const openWompiCheckout = (config: WompiConfig) => {
  if (typeof WidgetCheckout === 'undefined') {
    console.error("Wompi Widget no cargado. Revisa la conexión a internet.");
    if (config.onError) config.onError("Wompi Widget not loaded");
    return;
  }

  const checkout = new WidgetCheckout({
    currency: WOMPI_CONFIG.currency,
    amountInCents: Math.round(config.amount * 100),
    reference: config.reference,
    publicKey: WOMPI_CONFIG.publicKey,
    customerData: {
      email: config.email,
    }
  });

  checkout.open((result: any) => {
    const transaction = result.transaction;
    
    if (transaction.status === 'APPROVED') {
      // Celebración visual de alta fidelidad
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.7 },
        colors: ['#FF007F', '#1A1A40', '#CCFF00', '#FFFFFF']
      });
      config.onSuccess(transaction);
    } else {
      console.warn("Wompi Transaction Status:", transaction.status);
      if (config.onError) config.onError(transaction);
    }
    
    if (config.onClose) config.onClose();
  });
};

export const generateReference = (prefix: string = 'PB') => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${date}-${random}`;
};
