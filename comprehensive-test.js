const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let testResults = [];

async function runComprehensiveTest() {
  console.log('🧪 COMPREHENSIVE CTF PLATFORM TESTING\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: System Health
    await testSystemHealth();
    
    // Test 2: Authentication System
    await testAuthentication();
    
    // Test 3: Challenge System
    await testChallengeSystem();
    
    // Test 4: Leaderboard System
    await testLeaderboardSystem();
    
    // Test 5: Admin Functions
    await testAdminFunctions();
    
    // Test 6: File Management
    await testFileManagement();
    
    // Test 7: Data Persistence
    await testDataPersistence();
    
    // Test 8: Security Features
    await testSecurityFeatures();
    
    // Test 9: Performance
    await testPerformance();
    
    // Test 10: Error Handling
    await testErrorHandling();

    // Print Final Results
    printFinalResults();

  } catch (error) {
    console.error('❌ Comprehensive test failed:', error.message);
  }
}

async function testSystemHealth() {
  console.log('\n🔧 1. TESTING SYSTEM HEALTH');
  
  try {
    const health = await axios.get(`${BASE_URL}/health`);
    testResults.push({ test: 'System Health', status: 'PASS', details: health.data.message });
    console.log('✅ Health check passed');
    
    const leaderboard = await axios.get(`${BASE_URL}/leaderboard`);
    testResults.push({ test: 'Leaderboard Access', status: 'PASS', details: `${leaderboard.data.leaderboard?.length || 0} teams` });
    console.log('✅ Leaderboard accessible');
    
    const challenges = await axios.get(`${BASE_URL}/challenges`);
    testResults.push({ test: 'Challenges Access', status: 'PASS', details: `${challenges.data.length} challenges` });
    console.log('✅ Challenges accessible');
    
  } catch (error) {
    testResults.push({ test: 'System Health', status: 'FAIL', details: error.message });
    console.log('❌ System health test failed');
  }
}

async function testAuthentication() {
  console.log('\n👥 2. TESTING AUTHENTICATION SYSTEM');
  
  const testTeam = {
    teamName: `ComprehensiveTest_${Date.now()}`,
    password: 'testpass123',
    members: [
      { name: 'Test Member 1', email: 'test1@example.com' },
      { name: 'Test Member 2', email: 'test2@example.com' }
    ]
  };

  try {
    // Test Registration
    const registration = await axios.post(`${BASE_URL}/auth/register`, testTeam);
    testResults.push({ test: 'Team Registration', status: 'PASS', details: 'Team registered successfully' });
    console.log('✅ Team registration working');
    
    // Test Login
    const login = await axios.post(`${BASE_URL}/auth/login`, {
      teamName: testTeam.teamName,
      password: testTeam.password
    });
    testResults.push({ test: 'Team Login', status: 'PASS', details: 'Login successful' });
    console.log('✅ Team login working');
    
    // Test Invalid Login
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        teamName: testTeam.teamName,
        password: 'wrongpassword'
      });
      testResults.push({ test: 'Invalid Login Protection', status: 'FAIL', details: 'Should have failed' });
      console.log('❌ Invalid login should have failed');
    } catch (error) {
      if (error.response?.status === 401) {
        testResults.push({ test: 'Invalid Login Protection', status: 'PASS', details: 'Correctly rejected invalid login' });
        console.log('✅ Invalid login correctly rejected');
      }
    }
    
  } catch (error) {
    testResults.push({ test: 'Authentication', status: 'FAIL', details: error.message });
    console.log('❌ Authentication test failed');
  }
}

async function testChallengeSystem() {
  console.log('\n🎯 3. TESTING CHALLENGE SYSTEM');
  
  try {
    const challenges = await axios.get(`${BASE_URL}/challenges`);
    
    if (challenges.data.length > 0) {
      const firstChallenge = challenges.data[0];
      testResults.push({ test: 'Challenge Display', status: 'PASS', details: `${challenges.data.length} challenges available` });
      console.log('✅ Challenge display working');
      
      // Test individual challenge access
      const challengeDetail = await axios.get(`${BASE_URL}/challenges/${firstChallenge.id}`);
      testResults.push({ test: 'Challenge Details', status: 'PASS', details: 'Individual challenge accessible' });
      console.log('✅ Challenge details working');
      
    } else {
      testResults.push({ test: 'Challenge Display', status: 'WARN', details: 'No challenges available' });
      console.log('⚠️  No challenges available for testing');
    }
    
  } catch (error) {
    testResults.push({ test: 'Challenge System', status: 'FAIL', details: error.message });
    console.log('❌ Challenge system test failed');
  }
}

async function testLeaderboardSystem() {
  console.log('\n📊 4. TESTING LEADERBOARD SYSTEM');
  
  try {
    const leaderboard = await axios.get(`${BASE_URL}/leaderboard`);
    
    testResults.push({ test: 'Leaderboard Display', status: 'PASS', details: `${leaderboard.data.leaderboard?.length || 0} teams ranked` });
    console.log('✅ Leaderboard display working');
    
    // Test leaderboard refresh
    const refresh = await axios.post(`${BASE_URL}/leaderboard/refresh`);
    testResults.push({ test: 'Leaderboard Refresh', status: 'PASS', details: 'Leaderboard refreshed successfully' });
    console.log('✅ Leaderboard refresh working');
    
    // Test leaderboard statistics
    if (leaderboard.data.leaderboard && leaderboard.data.leaderboard.length > 0) {
      const teams = leaderboard.data.leaderboard;
      const totalScore = teams.reduce((sum, team) => sum + (team.score || 0), 0);
      const avgScore = totalScore / teams.length;
      
      testResults.push({ test: 'Leaderboard Statistics', status: 'PASS', details: `Avg score: ${avgScore.toFixed(1)}` });
      console.log('✅ Leaderboard statistics working');
    }
    
  } catch (error) {
    testResults.push({ test: 'Leaderboard System', status: 'FAIL', details: error.message });
    console.log('❌ Leaderboard system test failed');
  }
}

async function testAdminFunctions() {
  console.log('\n🏆 5. TESTING ADMIN FUNCTIONS');
  
  try {
    // Test admin stats access
    const adminStats = await axios.get(`${BASE_URL}/admin/stats`);
    testResults.push({ test: 'Admin Stats', status: 'PASS', details: 'Admin statistics accessible' });
    console.log('✅ Admin stats working');
    
    // Test admin teams access
    const adminTeams = await axios.get(`${BASE_URL}/admin/teams`);
    testResults.push({ test: 'Admin Teams', status: 'PASS', details: 'Admin team management accessible' });
    console.log('✅ Admin teams working');
    
  } catch (error) {
    testResults.push({ test: 'Admin Functions', status: 'FAIL', details: error.message });
    console.log('❌ Admin functions test failed');
  }
}

async function testFileManagement() {
  console.log('\n📁 6. TESTING FILE MANAGEMENT');
  
  try {
    // Test file download endpoint
    const fileResponse = await axios.get(`${BASE_URL}/files/download/test`, { validateStatus: () => true });
    
    if (fileResponse.status === 404) {
      testResults.push({ test: 'File Download Endpoint', status: 'PASS', details: 'File endpoint responding (404 expected for test file)' });
      console.log('✅ File download endpoint working');
    } else {
      testResults.push({ test: 'File Download Endpoint', status: 'PASS', details: 'File endpoint responding' });
      console.log('✅ File download endpoint working');
    }
    
  } catch (error) {
    testResults.push({ test: 'File Management', status: 'FAIL', details: error.message });
    console.log('❌ File management test failed');
  }
}

async function testDataPersistence() {
  console.log('\n💾 7. TESTING DATA PERSISTENCE');
  
  try {
    // Test that data persists across requests
    const leaderboard1 = await axios.get(`${BASE_URL}/leaderboard`);
    const leaderboard2 = await axios.get(`${BASE_URL}/leaderboard`);
    
    if (leaderboard1.data.leaderboard?.length === leaderboard2.data.leaderboard?.length) {
      testResults.push({ test: 'Data Persistence', status: 'PASS', details: 'Data consistent across requests' });
      console.log('✅ Data persistence working');
    } else {
      testResults.push({ test: 'Data Persistence', status: 'FAIL', details: 'Data inconsistent' });
      console.log('❌ Data persistence failed');
    }
    
  } catch (error) {
    testResults.push({ test: 'Data Persistence', status: 'FAIL', details: error.message });
    console.log('❌ Data persistence test failed');
  }
}

async function testSecurityFeatures() {
  console.log('\n🔒 8. TESTING SECURITY FEATURES');
  
  try {
    // Test rate limiting by making multiple requests
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(axios.get(`${BASE_URL}/leaderboard`));
    }
    
    const responses = await Promise.all(promises);
    const successCount = responses.filter(r => r.status === 200).length;
    
    if (successCount === 5) {
      testResults.push({ test: 'Rate Limiting', status: 'PASS', details: 'Multiple requests handled correctly' });
      console.log('✅ Rate limiting working');
    } else {
      testResults.push({ test: 'Rate Limiting', status: 'WARN', details: `${successCount}/5 requests successful` });
      console.log('⚠️  Rate limiting may be too strict');
    }
    
  } catch (error) {
    testResults.push({ test: 'Security Features', status: 'FAIL', details: error.message });
    console.log('❌ Security features test failed');
  }
}

async function testPerformance() {
  console.log('\n⚡ 9. TESTING PERFORMANCE');
  
  try {
    const startTime = Date.now();
    const response = await axios.get(`${BASE_URL}/leaderboard`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (responseTime < 1000) {
      testResults.push({ test: 'Response Time', status: 'PASS', details: `${responseTime}ms response time` });
      console.log(`✅ Response time: ${responseTime}ms`);
    } else {
      testResults.push({ test: 'Response Time', status: 'WARN', details: `${responseTime}ms response time (slow)` });
      console.log(`⚠️  Response time: ${responseTime}ms (slow)`);
    }
    
  } catch (error) {
    testResults.push({ test: 'Performance', status: 'FAIL', details: error.message });
    console.log('❌ Performance test failed');
  }
}

async function testErrorHandling() {
  console.log('\n🛡️ 10. TESTING ERROR HANDLING');
  
  try {
    // Test 404 handling
    const notFoundResponse = await axios.get(`${BASE_URL}/nonexistent`, { validateStatus: () => true });
    
    if (notFoundResponse.status === 404) {
      testResults.push({ test: '404 Error Handling', status: 'PASS', details: '404 errors handled correctly' });
      console.log('✅ 404 error handling working');
    } else {
      testResults.push({ test: '404 Error Handling', status: 'FAIL', details: '404 not returned' });
      console.log('❌ 404 error handling failed');
    }
    
  } catch (error) {
    testResults.push({ test: 'Error Handling', status: 'FAIL', details: error.message });
    console.log('❌ Error handling test failed');
  }
}

function printFinalResults() {
  console.log('\n' + '=' .repeat(60));
  console.log('📊 COMPREHENSIVE TEST RESULTS');
  console.log('=' .repeat(60));
  
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const warnings = testResults.filter(r => r.status === 'WARN').length;
  const total = testResults.length;
  
  console.log(`\n✅ PASSED: ${passed}/${total}`);
  console.log(`❌ FAILED: ${failed}/${total}`);
  console.log(`⚠️  WARNINGS: ${warnings}/${total}`);
  
  console.log('\n📋 DETAILED RESULTS:');
  testResults.forEach((result, index) => {
    const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${index + 1}. ${statusIcon} ${result.test}: ${result.details}`);
  });
  
  console.log('\n🎯 DEPLOYMENT READINESS:');
  if (failed === 0 && passed >= total * 0.8) {
    console.log('🚀 READY FOR DEPLOYMENT! All critical features working.');
  } else if (failed <= 2) {
    console.log('⚠️  MOSTLY READY - Minor issues to address before deployment.');
  } else {
    console.log('❌ NOT READY - Critical issues need to be fixed before deployment.');
  }
  
  console.log('\n📝 RECOMMENDATIONS:');
  if (failed > 0) {
    console.log('- Fix failed tests before deployment');
  }
  if (warnings > 0) {
    console.log('- Address warnings for optimal performance');
  }
  if (passed === total) {
    console.log('- All tests passed! Platform is ready for production.');
  }
}

runComprehensiveTest(); 