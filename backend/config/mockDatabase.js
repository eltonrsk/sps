// Mock database for testing without MySQL
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Mock data storage
let mockUsers = [];
let mockStudents = [];
let mockQRCodes = [];
let mockPickups = [];
let mockNotifications = [];
let mockGuardians = [];

// Initialize with admin user
const initializeMockData = async () => {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = {
    id: uuidv4(),
    email: 'admin@school.com',
    full_name: 'System Administrator',
    role: 'admin',
    phone_number: '+1234567890',
    password_hash: adminPassword,
    is_active: true,
    created_at: new Date().toISOString()
  };
  mockUsers.push(adminUser);
};

initializeMockData();

// Mock database functions
export const executeQuery = async (query, params = []) => {
  console.log('Mock Query:', query, 'Params:', params);
  
  // Handle different query types
  if (query.includes('SELECT') && query.includes('user_profiles')) {
    if (query.includes('WHERE email = ?')) {
      const user = mockUsers.find(u => u.email === params[0]);
      return user ? [user] : [];
    }
    if (query.includes('WHERE id = ?')) {
      const user = mockUsers.find(u => u.id === params[0]);
      return user ? [{
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone_number: user.phone_number,
        is_active: user.is_active,
        created_at: user.created_at
      }] : [];
    }
    if (query.includes('WHERE role = ?')) {
      const users = mockUsers
        .filter(u => u.role === params[0])
        .map(u => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          role: u.role,
          phone_number: u.phone_number,
          is_active: u.is_active,
          created_at: u.created_at
        }));
      return users;
    }
    return mockUsers.map(u => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
      phone_number: u.phone_number,
      is_active: u.is_active,
      created_at: u.created_at
    }));
  }
  
  if (query.includes('INSERT') && query.includes('user_profiles')) {
    const newUser = {
      id: uuidv4(),
      email: params[0],
      full_name: params[1],
      role: params[2],
      phone_number: params[3],
      password_hash: params[4],
      is_active: true,
      created_at: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return [{ insertId: newUser.id }];
  }
  
  if (query.includes('SELECT') && query.includes('students')) {
    return mockStudents;
  }
  
  if (query.includes('INSERT') && query.includes('students')) {
    const newStudent = {
      id: uuidv4(),
      first_name: params[0],
      last_name: params[1],
      grade: params[2],
      class_name: params[3],
      photo_url: params[4],
      created_by: params[5],
      is_active: true,
      created_at: new Date().toISOString()
    };
    mockStudents.push(newStudent);
    return [{ insertId: newStudent.id }];
  }
  
  if (query.includes('INSERT') && query.includes('qr_codes')) {
    const newQRCode = {
      id: uuidv4(),
      user_id: params[0],
      student_id: params[1],
      code: params[2],
      expires_at: params[3],
      is_active: true,
      created_at: new Date().toISOString(),
      last_used_at: null
    };
    mockQRCodes.push(newQRCode);
    return [{ insertId: newQRCode.id }];
  }
  
  if (query.includes('INSERT') && query.includes('pickups')) {
    const newPickup = {
      id: uuidv4(),
      student_id: params[0],
      picked_by_user_id: params[1],
      verified_by_user_id: params[2],
      qr_code_id: params[3],
      notes: params[4],
      pickup_time: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    mockPickups.push(newPickup);
    return [{ insertId: newPickup.id }];
  }
  
  if (query.includes('INSERT') && query.includes('notifications')) {
    const newNotification = {
      id: uuidv4(),
      user_id: params[0],
      title: params[1],
      message: params[2],
      type: params[3],
      is_read: false,
      created_at: new Date().toISOString()
    };
    mockNotifications.push(newNotification);
    return [{ insertId: newNotification.id }];
  }
  
  // Return empty result for unsupported queries
  return [];
};

export const executeTransaction = async (queries) => {
  const results = [];
  for (const { query, params } of queries) {
    const result = await executeQuery(query, params);
    results.push(result);
  }
  return results;
};

export const testConnection = async () => {
  console.log('✅ Mock database connected successfully');
  return true;
};
