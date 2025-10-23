import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// TwoFactorSetup and TwoFactorVerification interfaces removed - components deleted
// Keeping internal interfaces for service functionality

interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

interface TwoFactorVerification {
  isValid: boolean;
  remainingAttempts?: number;
}

class TwoFactorAuthService {
  private readonly APP_NAME = 'CRM System';
  private readonly BACKUP_CODES_COUNT = 10;

  /**
   * Generate a new 2FA secret and QR code for user setup
   */
  async generateSetup(userEmail: string): Promise<TwoFactorSetup> {
    try {
      // Generate a secret key
      const secret = authenticator.generateSecret();
      
      // Create the service name for the authenticator app
      const serviceName = `${this.APP_NAME} (${userEmail})`;
      
      // Generate the otpauth URL
      const otpauthUrl = authenticator.keyuri(userEmail, this.APP_NAME, secret);
      
      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);
      
      // Generate backup codes
      const backupCodes = this.generateBackupCodes();
      
      return {
        secret,
        qrCodeUrl,
        backupCodes
      };
    } catch (error) {
      throw new Error('Failed to generate 2FA setup');
    }
  }

  /**
   * Verify a 2FA token
   */
  verifyToken(token: string, secret: string): TwoFactorVerification {
    try {
      // Remove any spaces or formatting from the token
      const cleanToken = token.replace(/\s/g, '');
      
      // Verify the token
      const isValid = authenticator.verify({
        token: cleanToken,
        secret: secret
      });
      
      return { isValid };
    } catch (error) {
      return { isValid: false };
    }
  }

  /**
   * Verify a backup code
   */
  verifyBackupCode(code: string, userBackupCodes: string[]): { isValid: boolean; remainingCodes: string[] } {
    const cleanCode = code.replace(/\s/g, '').toLowerCase();
    const codeIndex = userBackupCodes.findIndex(backupCode => 
      backupCode.toLowerCase() === cleanCode
    );
    
    if (codeIndex === -1) {
      return { isValid: false, remainingCodes: userBackupCodes };
    }
    
    // Remove the used backup code
    const remainingCodes = userBackupCodes.filter((_, index) => index !== codeIndex);
    
    return { isValid: true, remainingCodes };
  }

  /**
   * Generate backup codes for account recovery
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < this.BACKUP_CODES_COUNT; i++) {
      // Generate 8-character alphanumeric codes
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    
    return codes;
  }

  /**
   * Generate new backup codes (when user requests new ones)
   */
  generateNewBackupCodes(): string[] {
    return this.generateBackupCodes();
  }

  /**
   * Check if 2FA is required for the user based on their role
   */
  is2FARequired(userRole: string): boolean {
    const rolesRequiring2FA = ['admin', 'manager', 'owner'];
    return rolesRequiring2FA.includes(userRole.toLowerCase());
  }

  /**
   * Validate 2FA setup completion
   */
  validateSetupCompletion(verificationToken: string, secret: string): boolean {
    return this.verifyToken(verificationToken, secret).isValid;
  }
}

export const twoFactorAuthService = new TwoFactorAuthService();
export default twoFactorAuthService;