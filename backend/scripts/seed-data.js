import { executeQuery } from '../config/database.js';
import bcrypt from 'bcryptjs';

// Sample data for testing
const sampleUsers = [
  {
    email: 'admin@school.com',
    full_name: 'System Administrator',
    role: 'admin',
    phone_number: '+1234567890',
    password: 'admin123'
  },
  {
    email: 'teacher1@school.com',
    full_name: 'Sarah Johnson',
    role: 'teacher',
    phone_number: '+1234567891',
    password: 'teacher123'
  },
  {
    email: 'parent1@school.com',
    full_name: 'John Smith',
    role: 'parent',
    phone_number: '+1234567892',
    password: 'parent123'
  },
  {
    email: 'security1@school.com',
    full_name: 'Mike Wilson',
    role: 'security',
    phone_number: '+1234567893',
    password: 'security123'
  }
];

const sampleStudents = [
  {
    first_name: 'Emma',
    last_name: 'Smith',
    grade: '1st Grade',
    class_name: 'A',
    created_by: null // Will be set after creating admin
  },
  {
    first_name: 'Liam',
    last_name: 'Johnson',
    grade: '2nd Grade',
    class_name: 'B',
    created_by: null
  },
  {
    first_name: 'Olivia',
    last_name: 'Brown',
    grade: '1st Grade',
    class_name: 'A',
    created_by: null
  },
  {
    first_name: 'Noah',
    last_name: 'Davis',
    grade: '3rd Grade',
    class_name: 'C',
    created_by: null
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await executeQuery('DELETE FROM notifications');
    await executeQuery('DELETE FROM pickups');
    await executeQuery('DELETE FROM qr_codes');
    await executeQuery('DELETE FROM guardians');
    await executeQuery('DELETE FROM students');
    await executeQuery('DELETE FROM user_profiles');
    
    // Insert users
    console.log('👥 Creating users...');
    const userIds = [];
    
    for (const user of sampleUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const query = `
        INSERT INTO user_profiles (email, full_name, role, phone_number, password_hash)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const result = await executeQuery(query, [
        user.email,
        user.full_name,
        user.role,
        user.phone_number,
        hashedPassword
      ]);
      
      userIds.push(result.insertId);
      console.log(`✅ Created user: ${user.full_name} (${user.email})`);
    }
    
    // Update students with admin ID as created_by
    const adminId = userIds[0];
    for (const student of sampleStudents) {
      student.created_by = adminId;
    }
    
    // Insert students
    console.log('🎓 Creating students...');
    const studentIds = [];
    
    for (const student of sampleStudents) {
      const query = `
        INSERT INTO students (first_name, last_name, grade, class_name, created_by)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const result = await executeQuery(query, [
        student.first_name,
        student.last_name,
        student.grade,
        student.class_name,
        student.created_by
      ]);
      
      studentIds.push(result.insertId);
      console.log(`✅ Created student: ${student.first_name} ${student.last_name}`);
    }
    
    // Create guardian relationships (parent1 is guardian for Emma and Olivia)
    console.log('👨‍👧 Creating guardian relationships...');
    const parentId = userIds[2]; // parent1
    
    await executeQuery(`
      INSERT INTO guardians (user_id, student_id, relationship, is_authorized)
      VALUES (?, ?, ?, ?)
    `, [parentId, studentIds[0], 'Father', true]);
    
    await executeQuery(`
      INSERT INTO guardians (user_id, student_id, relationship, is_authorized)
      VALUES (?, ?, ?, ?)
    `, [parentId, studentIds[2], 'Father', true]);
    
    console.log('✅ Created guardian relationships');
    
    // Generate some QR codes
    console.log('📱 Generating QR codes...');
    const { v4: uuidv4 } = await import('uuid');
    
    for (let i = 0; i < userIds.length; i++) {
      const code = uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase();
      await executeQuery(`
        INSERT INTO qr_codes (user_id, student_id, code, is_active)
        VALUES (?, ?, ?, ?)
      `, [userIds[i], i < studentIds.length ? studentIds[i] : null, code, true]);
      
      console.log(`✅ Generated QR code for user ${i + 1}`);
    }
    
    // Create some sample pickups
    console.log('🚗 Creating sample pickups...');
    const today = new Date();
    
    // Emma picked up by parent1, verified by security1
    await executeQuery(`
      INSERT INTO pickups (student_id, picked_by_user_id, verified_by_user_id, qr_code_id, notes)
      VALUES (?, ?, ?, ?, ?)
    `, [studentIds[0], parentId, userIds[3], 1, 'Normal pickup, no issues']);
    
    // Liam picked up by parent1, verified by security1
    await executeQuery(`
      INSERT INTO pickups (student_id, picked_by_user_id, verified_by_user_id, qr_code_id, notes)
      VALUES (?, ?, ?, ?, ?)
    `, [studentIds[1], parentId, userIds[3], 2, 'Early pickup - doctor appointment']);
    
    console.log('✅ Created sample pickups');
    
    // Create some notifications
    console.log('🔔 Creating notifications...');
    
    await executeQuery(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `, [parentId, 'Pickup Alert', 'Emma Smith has been picked up successfully.', 'pickup']);
    
    await executeQuery(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `, [parentId, 'QR Code Generated', 'New QR code has been generated for your account.', 'qr_code']);
    
    console.log('✅ Created notifications');
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('Admin: admin@school.com / admin123');
    console.log('Teacher: teacher1@school.com / teacher123');
    console.log('Parent: parent1@school.com / parent123');
    console.log('Security: security1@school.com / security123');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;
