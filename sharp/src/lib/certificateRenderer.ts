import type { Certificate, CertificateTemplate } from '@/types';

/**
 * Replace template variables with actual values
 */
function processTemplateText(text: string, certData: Record<string, any>) {
  if (!text) return '';
  return text.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    return certData[key.trim()] || '';
  });
}

/**
 * Render a certificate onto an offscreen canvas and return a data URL.
 */
export async function renderCertificateDataUrl(
  cert: Partial<Certificate>,
  template: CertificateTemplate,
  overrides?: { logoUrl?: string; logoUrls?: string[]; backgroundImageUrl?: string; signatureImageUrl?: string; signatureText?: string; primaryColor?: string; department?: string; textColor?: string; year?: number | null }
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 850;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Colors
  const primaryColor = overrides?.primaryColor || template.primaryColor || '#FACC15';
  const secondaryColor = template.secondaryColor || '#FFFBEB';
  const textColor = overrides?.textColor || template.textColor || '#000000';

  // Background
  const bgUrl = overrides?.backgroundImageUrl || template.backgroundImageUrl;
  if (bgUrl) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = bgUrl;
      });
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } catch (err) {
      console.warn('Failed to load background image', err);
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  } else {
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Borders
  ctx.strokeStyle = '#000000';
  if (template.borderStyle === 'solid' || template.borderStyle === 'double') {
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    if (template.borderStyle === 'double') {
      ctx.lineWidth = 2;
      ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);
    }
  } else if (template.borderStyle === 'dashed') {
    ctx.lineWidth = 4;
    ctx.setLineDash([15, 10]);
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    ctx.setLineDash([]); // reset
  }

  // Accent line
  if (template.layout === 'modern' || template.layout === 'standard' || template.layout === 'bold') {
    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, 0, canvas.width, 15);
    ctx.fillRect(0, canvas.height - 15, canvas.width, 15);
  } else if (template.layout === 'elegant') {
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
  }

  // Render variables
  const renderVars = {
    participantName: cert.userName || 'Participant Name',
    eventTitle: cert.eventTitle || 'Event Title',
    certificationType: (cert.type || template.eventType || 'Participation').toUpperCase(),
    date: cert.issueDate?.toDate 
      ? cert.issueDate.toDate().toLocaleDateString() 
      : new Date().toLocaleDateString(),
    id: cert.verificationCode || 'SAMPLE-1234',
    department: overrides?.department || cert.department || 'Department',
    year: (overrides?.year || cert.year) ? `${overrides?.year || cert.year}${['st','nd','rd'][((overrides?.year || cert.year)! % 10)-1] || 'th'} Year` : '',
    currentYear: new Date().getFullYear().toString()
  };

  const header = processTemplateText(template.headerText || 'CERTIFICATE OF {{certificationType}}', renderVars);
  const body = processTemplateText(template.bodyTemplate || 'This is to certify that\n\n{{participantName}}\n\nhas successfully participated in\n\n{{eventTitle}}', renderVars);
  const footer = processTemplateText(template.footerText || 'ID: {{id}} | Date: {{date}}', renderVars);

  // Logos (Multiple Support)
  let logoUrlsToDraw: string[] = [];
  if (overrides?.logoUrls && overrides.logoUrls.length > 0) {
    logoUrlsToDraw = overrides.logoUrls;
  } else if (overrides?.logoUrl) {
    logoUrlsToDraw = [overrides.logoUrl];
  } else if (template.logoUrls && template.logoUrls.length > 0) {
    logoUrlsToDraw = template.logoUrls;
  } else if (template.logoUrl) {
    logoUrlsToDraw = [template.logoUrl];
  }

  if (logoUrlsToDraw.length > 0) {
    const logoSize = 100;
    const y = 60;
    
    // Draw logos spread out if there are 2, otherwise center or distribute
    const spacing = logoUrlsToDraw.length === 1 ? 0 : (canvas.width - 300) / (logoUrlsToDraw.length - 1);
    const startX = logoUrlsToDraw.length === 1 ? canvas.width / 2 - logoSize / 2 : 150;

    for (let i = 0; i < logoUrlsToDraw.length; i++) {
        const url = logoUrlsToDraw[i];
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = url;
            });
            const x = logoUrlsToDraw.length === 1 ? startX : startX + (i * spacing) - (logoSize / 2);
            ctx.drawImage(img, x, y, logoSize, logoSize);
        } catch (err) {
            console.warn('Failed to load certificate logo', url, err);
        }
    }
  }

  // Typography Settings based on layout or custom properties
  const baseFontFamily = template.fontFamily || (template.layout === 'classic' || template.layout === 'elegant' ? 'serif' : template.layout === 'bold' || template.layout === 'minimal' ? 'sans-serif' : 'monospace');
  
  const pSize = template.primaryFontSize || (template.layout === 'bold' ? 52 : template.layout === 'minimal' ? 46 : template.layout === 'classic' ? 46 : 46);
  const sSize = template.secondaryFontSize || (template.layout === 'bold' ? 24 : template.layout === 'minimal' ? 18 : template.layout === 'classic' ? 24 : 22);
  
  const headerWeight = template.layout === 'bold' ? '900' : template.layout === 'minimal' ? '300' : 'bold';
  const nameWeight = template.layout === 'bold' ? '900' : template.layout === 'minimal' ? '300' : 'bold';
  const bodyWeight = template.layout === 'minimal' ? '300' : 'normal';

  let headerFont = `${headerWeight} ${pSize + 12}px ${baseFontFamily}`;
  let titleFont = `bold ${pSize - 10}px ${baseFontFamily}`;
  let nameFont = `${nameWeight} ${template.layout === 'classic' || template.layout === 'elegant' ? 'italic ' : ''}${pSize}px ${baseFontFamily}`;
  let bodyFont = `${bodyWeight} ${sSize}px ${baseFontFamily}`;
  let footerFont = `${sSize - 4}px ${baseFontFamily}`;
  let yOffset = template.layout === 'minimal' ? 40 : 0;
  
  const pTextColor = template.primaryTextColor || textColor;
  const sTextColor = template.secondaryTextColor || textColor;

  // Header
  ctx.fillStyle = template.layout === 'bold' ? primaryColor : pTextColor;
  ctx.textAlign = 'center';
  ctx.font = headerFont;
  ctx.fillText(header, canvas.width / 2, 200 + yOffset);
  
  if (template.layout !== 'minimal') {
    ctx.fillStyle = primaryColor;
    const lineY = template.layout === 'classic' || template.layout === 'elegant' ? 230 : 210;
    ctx.fillRect(canvas.width / 2 - 250, lineY + yOffset, 500, template.layout === 'bold' ? 8 : 4);
  }

  // Body
  ctx.fillStyle = sTextColor;
  ctx.font = bodyFont;
  ctx.textAlign = template.bodyAlignment || 'center';
  
  const bodyLines = body.split('\n');
  
  // Custom or default body position
  const bodyX = template.bodyPosition?.x !== undefined ? template.bodyPosition.x : (template.bodyAlignment === 'left' ? 120 : template.bodyAlignment === 'right' ? canvas.width - 120 : canvas.width / 2);
  let startY = template.bodyPosition?.y !== undefined ? template.bodyPosition.y : (320 + yOffset);
  
  bodyLines.forEach((line) => {
    if (line === renderVars.participantName) {
      ctx.fillStyle = pTextColor;
      ctx.font = nameFont;
      ctx.fillText(line, bodyX, startY);
      ctx.fillStyle = sTextColor;
      ctx.font = bodyFont;
      startY += 60;
    } else if (line === renderVars.eventTitle) {
      ctx.fillStyle = pTextColor;
      ctx.font = titleFont;
      ctx.fillText(line, bodyX, startY);
      ctx.fillStyle = sTextColor;
      ctx.font = bodyFont;
      startY += 50;
    } else if (line.trim() === '') {
      startY += 20; 
    } else {
      ctx.fillText(line, bodyX, startY);
      startY += 40;
    }
  });

  // Default legacy footer parsing if no explicit pos provided
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = sTextColor;
  ctx.font = footerFont;
  
  if (template.idPosition || template.datePosition) {
    if (template.idPosition) {
      ctx.textAlign = 'left';
      ctx.fillText(`ID: ${renderVars.id}`, template.idPosition.x, template.idPosition.y);
    }
    if (template.datePosition) {
      ctx.textAlign = 'left';
      ctx.fillText(`Date: ${renderVars.date}`, template.datePosition.x, template.datePosition.y);
    }
  } else {
    const footerLines = footer.split('\n');
    let footY = 700;
    ctx.textAlign = 'left';
    footerLines.forEach((line) => {
      ctx.fillText(line, 80, footY);
      footY += 25;
    });
  }
  ctx.globalAlpha = 1.0;

  // Signature
  const sigText = overrides?.signatureText || template.signatureText || 'Authorized Signature';
  const sigImgUrl = overrides?.signatureImageUrl || template.signatureImageUrl;
  
  ctx.textAlign = 'center';
  const sigX = template.signaturePosition?.x !== undefined ? template.signaturePosition.x : (canvas.width - 250);
  const sigY = template.signaturePosition?.y !== undefined ? template.signaturePosition.y : 680;

  if (sigImgUrl) {
    try {
      const sigImg = new Image();
      sigImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        sigImg.onload = resolve;
        sigImg.onerror = reject;
        sigImg.src = sigImgUrl;
      });
      ctx.drawImage(sigImg, sigX - 100, sigY - 80, 200, 80);
    } catch (err) {
      console.warn('Failed to load signature image', err);
    }
  }

  // Signature line
  if (template.layout !== 'minimal') {
      ctx.strokeStyle = pTextColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sigX - 120, sigY + 10);
      ctx.lineTo(sigX + 120, sigY + 10);
      ctx.stroke();
  }

  ctx.fillStyle = pTextColor;
  ctx.font = `${template.layout === 'minimal' ? 'normal' : 'bold'} ${sSize - 2}px ${baseFontFamily}`;
  ctx.fillText(sigText, sigX, sigY + 35);

  return canvas.toDataURL('image/png');
}

/**
 * Renders and triggers download of a certificate
 */
export async function downloadCertificate(
  cert: Partial<Certificate>,
  template: CertificateTemplate,
  overrides?: { logoUrl?: string; logoUrls?: string[]; backgroundImageUrl?: string; signatureImageUrl?: string; signatureText?: string; primaryColor?: string; department?: string; textColor?: string; year?: number | null }
) {
  try {
    const dataUrl = await renderCertificateDataUrl(cert, template, overrides);
    const link = document.createElement('a');
    link.download = `certificate_${cert.verificationCode || 'preview'}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Failed to download certificate', err);
    alert('Failed to generate certificate image.');
  }
}
