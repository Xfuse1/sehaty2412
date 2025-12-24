const AIRTABLE_TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
const DOCTORS_TABLE = 'Doctors Images';
const PATIENTS_TABLE = 'Patients Images';

export const saveToAirtable = async (doctorId: string, doctorName: string, imageUrl: string) => {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    console.error('Airtable credentials missing');
    throw new Error('إعدادات Airtable غير مكتملة. يرجى التأكد من إضافة NEXT_PUBLIC_AIRTABLE_TOKEN و NEXT_PUBLIC_AIRTABLE_BASE_ID في إعدادات Vercel.');
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${DOCTORS_TABLE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              'Doctor ID': doctorId,
              'Doctor Name': doctorName,
              'Attachments': [
                {
                  url: imageUrl,
                  filename: `doctor_${doctorId}.jpg`
                }
              ],
            },
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Airtable Error Response:', data);
      throw new Error(`تعذر الحفظ في Airtable: ${data.error?.message || JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    console.error('Error saving to Airtable:', error);
    throw error;
  }
};

export const savePrescriptionToAirtable = async (
  patientId: string,
  patientName: string,
  imageUrl: string
) => {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    console.error('Airtable credentials missing');
    throw new Error('إعدادات Airtable غير مكتملة. يرجى التأكد من إضافة NEXT_PUBLIC_AIRTABLE_TOKEN و NEXT_PUBLIC_AIRTABLE_BASE_ID في إعدادات Vercel.');
  }

  try {
    // We try to match common Airtable field naming patterns
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${PATIENTS_TABLE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              'Patient ID': patientId, // Changed to space as it is more common
              'Patient Name': patientName, // Changed to space
              'Attachments': [
                {
                  url: imageUrl,
                  filename: `prescription_${patientId}_${Date.now()}.jpg`
                }
              ],
            },
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Airtable Error Response:', data);
      // Try fallback to underscores if spaces fail
      if (data.error?.type === 'UNKNOWN_FIELD_NAME') {
        return await savePrescriptionToAirtableFallback(patientId, patientName, imageUrl);
      }
      throw new Error(`تعذر حفظ الروشتة في Airtable: ${data.error?.message || JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    console.error('Error saving prescription to Airtable:', error);
    throw error;
  }
};

// Fallback for underscore naming convention
const savePrescriptionToAirtableFallback = async (patientId: string, patientName: string, imageUrl: string) => {
  const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${PATIENTS_TABLE}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [
        {
          fields: {
            'Patient_ID': patientId,
            'Patient_Name': patientName,
            'Attachments': [
              {
                url: imageUrl,
                filename: `prescription_${patientId}_${Date.now()}.jpg`
              }
            ],
          },
        },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`تعذر حفظ الروشتة في Airtable (Fallback): ${data.error?.message || JSON.stringify(data)}`);
  }
  return data;
}