import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { dbPath } from './db';

const ALGORITHM = 'aes-256-cbc';
const SALT = 'Kurum Başkanlığı-kurum-vault-v1'; // 🛡️ kurum Master Salt

export class VaultService {
    private static getStoragePath() {
        return path.join(path.dirname(dbPath), '.vault_recovery.key');
    }

    private static deriveKey(password: string): Buffer {
        return crypto.scryptSync(password, SALT, 32);
    }

    static encrypt(text: string, password: string): string {
        if (!text) return '';
        const key = this.deriveKey(password);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    static decrypt(hash: string, password: string): string {
        if (!hash || !hash.includes(':')) return hash;
        try {
            const [ivHex, encryptedHex] = hash.split(':');
            const iv = Buffer.from(ivHex, 'hex');
            const encrypted = Buffer.from(encryptedHex, 'hex');
            const key = this.deriveKey(password);
            const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
            const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
            return decrypted.toString();
        } catch (e) {
            return hash; 
        }
    }

    static encryptBuffer(buffer: Buffer, password: string): Buffer {
        const key = this.deriveKey(password);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        return Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
    }

    static decryptBuffer(buffer: Buffer, password: string): Buffer {
        try {
            const key = this.deriveKey(password);
            const iv = buffer.subarray(0, 16);
            const data = buffer.subarray(16);
            const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
            return Buffer.concat([decipher.update(data), decipher.final()]);
        } catch (e: any) {
            throw new Error(`Şifre çözme başarısız! Anahtar veya dosya hatalı olabilir: ${e.message}`);
        }
    }

    static getVaultInfo(password: string) {
        const trace = crypto.createHash('sha256').update(password || 'empty').digest('hex');
        return {
            success: true,
            algorithm: 'AES-256-CBC',
            status: password ? 'KORUMALI / AKTİF' : 'AÇIK / ŞİFRESİZ',
            vaultPath: this.getStoragePath(),
            keyHash: trace.substring(0, 32).toUpperCase()
        };
    }
}

