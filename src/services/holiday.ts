import { graphQLClient } from '@/lib/graphql';

export interface Holiday {
  id: string;
  date: string;
  name: string;
  description?: string;
  isNational: boolean;
  createdBy?: {
    id: string;
    fullName: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HolidayInput {
  holiday_date: string;
  holiday_name: string;
  is_national_holiday: boolean;
}

interface GetHolidaysResponse {
  holidays: Holiday[];
}

interface GetHolidayResponse {
  holiday: Holiday;
}

interface GetHolidayByDateResponse {
  holidayByDate: Holiday;
}

interface IsHolidayResponse {
  isHoliday: boolean;
}

interface CreateHolidayInput {
  date: string;
  name: string;
  description?: string;
  isNational?: boolean;
}

interface UpdateHolidayInput {
  id: string;
  date?: string;
  name?: string;
  description?: string;
  isNational?: boolean;
}

interface CreateHolidayResponse {
  createHoliday: Holiday;
}

interface UpdateHolidayResponse {
  updateHoliday: Holiday;
}

interface DeleteHolidayResponse {
  deleteHoliday: boolean;
}

export interface ImportHolidaysResult {
  success: boolean;
  message: string;
  importedCount: number;
  skippedCount: number;
}

interface ImportHolidaysResponse {
  importHolidays: ImportHolidaysResult;
}

interface ImportHolidaysFromDataResponse {
  importHolidaysFromData: ImportHolidaysResult;
}

const GET_HOLIDAYS = `
  query GetHolidays($startDate: String, $endDate: String) {
    holidays(startDate: $startDate, endDate: $endDate) {
      id
      date
      name
      description
      isNational
      createdBy {
        id
        fullName
        username
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_HOLIDAY = `
  query GetHoliday($id: ID!) {
    holiday(id: $id) {
      id
      date
      name
      description
      isNational
      createdBy {
        id
        fullName
        username
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_HOLIDAY_BY_DATE = `
  query GetHolidayByDate($date: String!) {
    holidayByDate(date: $date) {
      id
      date
      name
      description
      isNational
      createdBy {
        id
        fullName
        username
      }
      createdAt
      updatedAt
    }
  }
`;

const IS_HOLIDAY = `
  query IsHoliday($date: String!) {
    isHoliday(date: $date)
  }
`;

const CREATE_HOLIDAY = `
  mutation CreateHoliday($date: String!, $name: String!, $description: String, $isNational: Boolean) {
    createHoliday(
      date: $date
      name: $name
      description: $description
      isNational: $isNational
    ) {
      id
      date
      name
      description
      isNational
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_HOLIDAY = `
  mutation UpdateHoliday($id: ID!, $date: String, $name: String, $description: String, $isNational: Boolean) {
    updateHoliday(
      id: $id
      date: $date
      name: $name
      description: $description
      isNational: $isNational
    ) {
      id
      date
      name
      description
      isNational
      createdAt
      updatedAt
    }
  }
`;

const DELETE_HOLIDAY = `
  mutation DeleteHoliday($id: ID!) {
    deleteHoliday(id: $id)
  }
`;

const IMPORT_HOLIDAYS = `
  mutation ImportHolidays($year: Int) {
    importHolidays(year: $year) {
      success
      message
      importedCount
      skippedCount
    }
  }
`;

const IMPORT_HOLIDAYS_FROM_DATA = `
  mutation ImportHolidaysFromData($holidays: [HolidayInput!]!) {
    importHolidaysFromData(holidays: $holidays) {
      success
      message
      importedCount
      skippedCount
    }
  }
`;

export const getHolidays = async (token: string, startDate?: string, endDate?: string): Promise<Holiday[]> => {
  try {
    console.log(`[HolidayService] Fetching holidays with params:`, { startDate, endDate });
    const response = await graphQLClient.request<GetHolidaysResponse>(
      GET_HOLIDAYS,
      { startDate, endDate },
      { Authorization: `Bearer ${token}` }
    );
    
    // Debug log untuk melihat data yang diterima dari server
    console.log(`[HolidayService] Received ${response.holidays.length} holidays from server`);
    
    // Memeriksa nilai isNational
    const nationalHolidays = response.holidays.filter(h => h.isNational);
    console.log(`[HolidayService] Found ${nationalHolidays.length} national holidays`);
    if (nationalHolidays.length > 0) {
      console.log('[HolidayService] Sample national holiday:', nationalHolidays[0]);
    }

    return response.holidays;
  } catch (error) {
    console.error('Error fetching holidays:', error);
    throw error;
  }
};

export const getHoliday = async (id: string, token: string): Promise<Holiday> => {
  try {
    const response = await graphQLClient.request<GetHolidayResponse>(
      GET_HOLIDAY,
      { id },
      { Authorization: `Bearer ${token}` }
    );
    return response.holiday;
  } catch (error) {
    console.error('Error fetching holiday:', error);
    throw error;
  }
};

export const getHolidayByDate = async (date: string, token: string): Promise<Holiday | null> => {
  try {
    const response = await graphQLClient.request<GetHolidayByDateResponse>(
      GET_HOLIDAY_BY_DATE,
      { date },
      { Authorization: `Bearer ${token}` }
    );
    return response.holidayByDate;
  } catch (error) {
    console.error('Error fetching holiday by date:', error);
    return null;
  }
};

export const isHoliday = async (date: string, token: string): Promise<boolean> => {
  try {
    const response = await graphQLClient.request<IsHolidayResponse>(
      IS_HOLIDAY,
      { date },
      { Authorization: `Bearer ${token}` }
    );
    return response.isHoliday;
  } catch (error) {
    console.error('Error checking if date is holiday:', error);
    return false;
  }
};

export const createHoliday = async (input: CreateHolidayInput, token: string): Promise<Holiday> => {
  try {
    const response = await graphQLClient.request<CreateHolidayResponse>(
      CREATE_HOLIDAY,
      input,
      { Authorization: `Bearer ${token}` }
    );
    return response.createHoliday;
  } catch (error) {
    console.error('Error creating holiday:', error);
    throw error;
  }
};

export const updateHoliday = async (input: UpdateHolidayInput, token: string): Promise<Holiday> => {
  try {
    const response = await graphQLClient.request<UpdateHolidayResponse>(
      UPDATE_HOLIDAY,
      input,
      { Authorization: `Bearer ${token}` }
    );
    return response.updateHoliday;
  } catch (error) {
    console.error('Error updating holiday:', error);
    throw error;
  }
};

export const deleteHoliday = async (id: string, token: string): Promise<boolean> => {
  try {
    const response = await graphQLClient.request<DeleteHolidayResponse>(
      DELETE_HOLIDAY,
      { id },
      { Authorization: `Bearer ${token}` }
    );
    return response.deleteHoliday;
  } catch (error) {
    console.error('Error deleting holiday:', error);
    throw error;
  }
};

export const importHolidays = async (year: number, token: string): Promise<ImportHolidaysResult> => {
  try {
    const response = await graphQLClient.request<ImportHolidaysResponse>(
      IMPORT_HOLIDAYS,
      { year },
      { Authorization: `Bearer ${token}` }
    );
    return response.importHolidays;
  } catch (error) {
    console.error('Error importing holidays:', error);
    throw error;
  }
};

export const importHolidaysFromData = async (holidays: HolidayInput[], token: string): Promise<ImportHolidaysResult> => {
  try {
    const response = await graphQLClient.request<ImportHolidaysFromDataResponse>(
      IMPORT_HOLIDAYS_FROM_DATA,
      { holidays },
      { Authorization: `Bearer ${token}` }
    );
    return response.importHolidaysFromData;
  } catch (error) {
    console.error('Error importing holidays from data:', error);
    throw error;
  }
}; 