const crypto = require('crypto'); 
 
const algorithm = 'aes-256-cbc'; 
 
function encrypt(text) { 
  try { 
    const iv = crypto.randomBytes(16); 
    const cipher = crypto.createCipher(algorithm, secretKey); 
    let encrypted = cipher.update(text, 'utf8', 'hex'); 
    encrypted += cipher.final('hex'); 
    return { 
      encryptedData: encrypted, 
      iv: iv.toString('hex') 
    }; 
  } catch (error) { 
    console.error('Encryption error:', error); 
    throw new Error('Failed to encrypt message'); 
  } 
} 
 
function decrypt(encryptedData, iv) { 
  try { 
    const decipher = crypto.createDecipher(algorithm, secretKey); 
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8'); 
    decrypted += decipher.final('utf8'); 
    return decrypted; 
  } catch (error) { 
    console.error('Decryption error:', error); 
    throw new Error('Failed to decrypt message'); 
  } 
} 
 
function generateSecureKey() { 
  return crypto.randomBytes(32).toString('hex'); 
} 
 
module.exports = { 
  encrypt, 
  decrypt, 
  generateSecureKey 
}; 
