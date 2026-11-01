import { ViolationRecord } from '../types/traffic';

/**
 * Sanitizes user-controlled string values to prevent formula injection attacks
 * in Microsoft Excel, LibreOffice, and Google Sheets (=, +, -, @, \t, \r).
 */
export function sanitizeForSpreadsheet(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

export function exportViolationsToCSV(records: ViolationRecord[], filename = 'trafficguard_violations.csv'): void {
  const headers = [
    'Incident ID',
    'Camera ID',
    'Location',
    'Recorded At',
    'Vehicle Type',
    'Tracking ID',
    'Violation Type',
    'Severity',
    'Detection Confidence',
    'License Plate',
    'OCR Confidence',
    'Estimated Speed (km/h)',
    'Speed Limit (km/h)',
    'Review Status',
    'Reviewer Notes',
    'Calibration Status'
  ];

  const rows = records.map((r) => [
    sanitizeForSpreadsheet(r.incidentCode),
    sanitizeForSpreadsheet(r.cameraId),
    sanitizeForSpreadsheet(r.cameraLocation),
    sanitizeForSpreadsheet(r.recordedAt),
    sanitizeForSpreadsheet(r.vehicleType),
    sanitizeForSpreadsheet(r.trackingId),
    sanitizeForSpreadsheet(r.violationType),
    sanitizeForSpreadsheet(r.severity),
    sanitizeForSpreadsheet((r.confidence * 100).toFixed(1) + '%'),
    sanitizeForSpreadsheet(r.licensePlate || 'N/A'),
    sanitizeForSpreadsheet(r.plateConfidence ? (r.plateConfidence * 100).toFixed(1) + '%' : 'N/A'),
    sanitizeForSpreadsheet(r.estimatedSpeed ?? 'N/A'),
    sanitizeForSpreadsheet(r.speedLimit ?? 'N/A'),
    sanitizeForSpreadsheet(r.reviewStatus),
    sanitizeForSpreadsheet(r.reviewerNotes ?? ''),
    sanitizeForSpreadsheet(r.calibrationStatus)
  ]);

  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
