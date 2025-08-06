const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Initialize local database with sample data
const DB_PATH = path.join(__dirname, '../../data');

// Ensure data directory exists
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true });
}

// Sample data
const sampleData = {
  teams: [
    {
      id: 'team_1',
      name: 'Team Alpha',
      password: bcrypt.hashSync('password123', 10),
      members: [
        { name: 'Alice Johnson', email: 'alice@example.com' },
        { name: 'Bob Smith', email: 'bob@example.com' }
      ],
      avatar: '👥',
      score: 150,
      submissions: [],
      lastSubmission: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'team_2',
      name: 'Team Beta',
      password: bcrypt.hashSync('password123', 10),
      members: [
        { name: 'Charlie Brown', email: 'charlie@example.com' }
      ],
      avatar: '🦄',
      score: 200,
      submissions: [],
      lastSubmission: null,
      createdAt: new Date().toISOString()
    }
  ],
  
  challenges: [
    {
      id: 'challenge_1',
      title: 'Welcome to CTF',
      description: 'This is your first challenge. Find the flag hidden in this description.',
      category: 'Web',
      points: 50,
      difficulty: 'Easy',
      flag: 'FLAG{WELCOME_TO_CTF}',
      hints: ['Look carefully at the description', 'The flag format is FLAG{...}'],
      files: [],
      solvedCount: 1,
      solvedBy: ['Team Alpha'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'challenge_2',
      title: 'Crypto Basics',
      description: 'Decrypt this message: VGhlIGZsYWcgaXMgRkxBR3tDUllQVE9fQkFTSUMzfQ==',
      category: 'Crypto',
      points: 100,
      difficulty: 'Medium',
      flag: 'FLAG{CRYPTO_BASIC3}',
      hints: ['This is base64 encoded', 'Decode it to get the flag'],
      files: [],
      solvedCount: 0,
      solvedBy: [],
      createdAt: new Date().toISOString()
    },
    {
      id: 'challenge_3',
      title: 'Forensics Challenge',
      description: 'Analyze this image file to find the hidden flag.',
      category: 'Forensics',
      points: 150,
      difficulty: 'Hard',
      flag: 'FLAG{HIDDEN_IN_IMAGE}',
      hints: ['Check the image metadata', 'Look for steganography'],
      files: [],
      solvedCount: 0,
      solvedBy: [],
      createdAt: new Date().toISOString()
    }
  ],
  
  submissions: [
    {
      id: 'sub_1',
      teamName: 'Team Alpha',
      challengeId: 'challenge_1',
      challengeTitle: 'Welcome to CTF',
      flag: 'FLAG{WELCOME_TO_CTF}',
      correct: true,
      timestamp: new Date().toISOString()
    }
  ],
  
  leaderboard: [
    {
      id: 'lb_1',
      teamName: 'Team Beta',
      score: 200,
      rank: 1,
      solvedCount: 2,
      lastSubmission: new Date().toISOString()
    },
    {
      id: 'lb_2',
      teamName: 'Team Alpha',
      score: 150,
      rank: 2,
      solvedCount: 1,
      lastSubmission: new Date().toISOString()
    }
  ],
  
  notifications: [
    {
      id: 'notif_1',
      title: 'Welcome to CTF Platform!',
      message: 'Welcome to our CTF platform. Good luck with the challenges!',
      type: 'info',
      createdAt: new Date().toISOString()
    }
  ]
};

// Write sample data to files
Object.entries(sampleData).forEach(([collection, data]) => {
  const filePath = path.join(DB_PATH, `${collection}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ Created ${collection}.json with ${data.length} records`);
});

console.log('\n🎉 Local database initialized successfully!');
console.log('📁 Data files created in:', DB_PATH);
console.log('\nSample login credentials:');
console.log('Team: Team Alpha, Password: password123');
console.log('Team: Team Beta, Password: password123');
console.log('\nAdmin credentials:');
console.log('Username: Admin, Password: pavanrocks'); 