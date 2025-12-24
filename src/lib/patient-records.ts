import { savePrescriptionToAirtable } from './airtable';

export const savePatientPrescription = async (patientId: string, patientName: string, imageUrl: string) => {
  return await savePrescriptionToAirtable(patientId, patientName, imageUrl);
};