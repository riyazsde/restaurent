/**
 * Utility functions for exporting and importing customers via CSV
 */

export const exportCustomersToCSV = (customers = [], filename = 'customers.csv') => {
  if (!Array.isArray(customers) || customers.length === 0) {
    return false;
  }

  const headers = ['Name', 'Phone', 'DOB', 'Customer Type', 'Address', 'Notes', 'Created At'];

  const rows = customers.map((c) => {
    const typeStr =
      c.CustomerType?.type ||
      (c.Customer_type_id === 1 ? 'Premium VIP' : c.Customer_type_id === 2 ? 'VIP' : 'Standard');
    const dobStr = c.DOB ? c.DOB.split('T')[0] : '';
    const createdStr = c.CreateAt ? new Date(c.CreateAt).toLocaleDateString('en-GB') : '';

    return [
      c.Name || c.name || '',
      c.phone || c.Phone || '',
      dobStr,
      typeStr,
      c.Address || c.address || '',
      c.Notes || c.notes || '',
      createdStr
    ].map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`);
  });

  const csvContent =
    '\uFEFF' +
    [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};

export const downloadCustomerTemplateCSV = () => {
  const headers = ['Name', 'Phone', 'DOB', 'Customer_type_id', 'Address', 'Notes'];
  const sampleRows = [
    ['John Doe', '+27721234567', '1990-01-01', '1', '123 Main St', 'Prefers window table'],
    ['Jane Smith', '+27729876543', '1995-05-15', '2', '456 Oak Ave', 'VIP guest']
  ];

  const csvContent =
    '\uFEFF' +
    [
      headers.map((h) => `"${h}"`).join(','),
      ...sampleRows.map((r) => r.map((v) => `"${v}"`).join(','))
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'customers_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const parseCustomersCSV = (csvText) => {
  if (!csvText || typeof csvText !== 'string') return { validRows: [], skippedCount: 0 };

  const lines = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  const cleanText = csvText.replace(/^\uFEFF/, '');

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      if (currentRow.some((col) => col.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((col) => col.length > 0)) {
      lines.push(currentRow);
    }
  }

  if (lines.length < 2) {
    return { validRows: [], skippedCount: 0 };
  }

  const headers = lines[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const nameIndex = headers.findIndex((h) => h === 'name' || h === 'customername' || h === 'fullname');
  const phoneIndex = headers.findIndex((h) => h === 'phone' || h === 'phonenumber' || h === 'mobile');
  const dobIndex = headers.findIndex((h) => h === 'dob' || h === 'birthdate' || h === 'dateofbirth');
  const typeIndex = headers.findIndex(
    (h) => h === 'customertypeid' || h === 'customertype' || h === 'type'
  );
  const addressIndex = headers.findIndex((h) => h === 'address');
  const notesIndex = headers.findIndex((h) => h === 'notes' || h === 'note');

  const validRows = [];
  let skippedCount = 0;

  for (let r = 1; r < lines.length; r++) {
    const row = lines[r];
    const name = nameIndex !== -1 ? row[nameIndex] : '';
    const rawPhone = phoneIndex !== -1 ? row[phoneIndex] : '';
    const cleanPhone = String(rawPhone || '').replace(/[\s\-()]/g, '');

    if (!name || !cleanPhone || cleanPhone.length < 7) {
      skippedCount++;
      continue;
    }

    let dob = dobIndex !== -1 && row[dobIndex] ? row[dobIndex] : null;
    if (dob && /^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(dob)) {
      const parts = dob.split(/[\/\-]/);
      dob = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    let customerTypeId = 1;
    if (typeIndex !== -1 && row[typeIndex]) {
      const val = row[typeIndex].toString().toLowerCase();
      if (val.includes('2') || val === 'vip') {
        customerTypeId = 2;
      } else {
        customerTypeId = 1;
      }
    }

    const address = addressIndex !== -1 ? row[addressIndex] || '' : '';
    const notes = notesIndex !== -1 ? row[notesIndex] || '' : '';

    validRows.push({
      Name: name,
      phone: cleanPhone,
      DOB: dob,
      Customer_type_id: customerTypeId,
      Table_id: 5,
      Address: address,
      Notes: notes,
      Status: true
    });
  }

  return { validRows, skippedCount };
};
