
/*
  Simple utility to generate BR Code (PIX Payload)
  Based on the EMV® QR Code Specification for Payment Systems
*/

function crc16(str: string): string {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export function generatePixPayload(
  key: string,
  keyType: string,
  name: string = "Pagamento",
  city: string = "Brasil",
  amount: number | null = null,
  txid: string = '***'
): string {
  // normalize key based on type
  let pixKey = key.replace(/\s/g, '');
  
  // Basic payload construction
  const payloadKey = '000101021243650014br.gov.bcb.pix01' + (pixKey.length + (keyType === 'phone' && !pixKey.startsWith('+55') ? 3 : 0)).toString() + (keyType === 'phone' && !pixKey.startsWith('+55') ? '+55' + pixKey : pixKey) + '520400005303986';
  
  // Amount (54)
  let payloadAmount = '';
  if (amount) {
      payloadAmount = formatField('54', amount.toFixed(2));
  }

  const payloadBase = 
    '000201' + // Payload Format Indicator
    formatField('26', // Merchant Account Info
      '0014br.gov.bcb.pix' + 
      formatField('01', pixKey) // The actual key
    ) + 
    '52040000' + // Merchant Category Code
    '5303986' + // Transaction Currency (BRL)
    (amount ? formatField('54', amount.toFixed(2)) : '') +
    '5802BR' + // Country Code
    formatField('59', name.substring(0, 25)) + // Merchant Name
    formatField('60', city.substring(0, 15)) + // Merchant City
    formatField('62', // Additional Data Field
      formatField('05', txid)
    ) + 
    '6304'; // CRC16 placeholder

  const crc = crc16(payloadBase);
  return payloadBase + crc;
}
