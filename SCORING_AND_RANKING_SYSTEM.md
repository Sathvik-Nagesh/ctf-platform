# Scoring and Ranking System

## 🎯 How Scoring Works

### **Primary Ranking Factor: Score**
- **Positions are determined by TOTAL SCORE** (highest first)
- **Score = Sum of all challenge points earned**
- Each correct flag submission awards the challenge's point value
- Example: Solving a 10-point challenge = +10 to total score

### **Secondary Display: Solved Count**
- **Solved count is for display purposes only**
- Shows how many challenges a team has solved
- Does NOT affect ranking position
- Helps teams track their progress

## 📊 Ranking Logic

### **1. Primary Sort: Score (Descending)**
```javascript
// Teams are ranked by score (highest first)
const leaderboard = teams.sort((a, b) => b.score - a.score);
```

### **2. Secondary Sort: Time (Ascending)**
- If two teams have the same score, the team who solved first gets higher rank
- This encourages early participation and quick problem-solving

### **3. Display Information**
- **Rank**: Position based on score
- **Score**: Total points earned
- **Solved**: Number of challenges completed
- **Last Solve**: Timestamp of most recent correct submission

## 🏆 Example Scenarios

### **Scenario 1: Different Scores**
```
Team A: 50 points (3 challenges solved) → Rank #1
Team B: 30 points (2 challenges solved) → Rank #2
Team C: 10 points (1 challenge solved) → Rank #3
```

### **Scenario 2: Same Score, Different Times**
```
Team A: 30 points, solved at 2:00 PM → Rank #1
Team B: 30 points, solved at 2:30 PM → Rank #2
```

### **Scenario 3: Mixed Scenarios**
```
Team A: 50 points (3 challenges) → Rank #1
Team B: 30 points (2 challenges) → Rank #2
Team C: 30 points (1 challenge) → Rank #3 (solved later)
```

## 🎯 Key Points

### **✅ What Matters for Ranking:**
- **Total Score**: Primary ranking factor
- **Submission Time**: Tiebreaker for same scores
- **Correct Flags**: Only correct submissions award points

### **✅ What Doesn't Affect Ranking:**
- **Solved Count**: Display only
- **Incorrect Submissions**: No penalty
- **Challenge Difficulty**: All points count equally

### **✅ Scoring Rules:**
- ✅ **Correct Flag**: Awards full challenge points
- ✅ **Incorrect Flag**: No points awarded, no penalty
- ✅ **Duplicate Submission**: No additional points
- ✅ **Rate Limiting**: Prevents spam, doesn't affect scoring

## 🚀 Current System Status

### **✅ Ranking System Working:**
- ✅ **Score-based ranking**: Teams ranked by total points
- ✅ **Time-based tiebreaker**: Earlier submissions rank higher
- ✅ **Real-time updates**: Rankings update immediately after submissions
- ✅ **Accurate display**: Shows correct rank, score, and solved count

### **✅ Visual Improvements:**
- ✅ **Better text visibility**: "Your Team Position" now has black text on white background
- ✅ **Enhanced information**: Shows rank, score, solved count, and last solve time
- ✅ **Clear hierarchy**: Primary focus on score, secondary on solved count

## 🎯 Example Leaderboard

```
Rank | Team      | Score | Solved | Last Solve
-----|-----------|-------|--------|------------
#1   | Team A    | 50pts | 3      | 2:00 PM
#2   | Team B    | 30pts | 2      | 2:30 PM  
#3   | Team C    | 30pts | 1      | 3:00 PM
#4   | Team D    | 10pts | 1      | 1:30 PM
```

**Key Points:**
- Team A wins with highest score (50 points)
- Team B ranks above Team C despite same score (30 points) because Team B solved earlier
- Solved count is for reference only

## 🎉 System Summary

**Your CTF platform uses a fair, score-based ranking system where:**
- ✅ **Score determines position** (highest wins)
- ✅ **Time breaks ties** (earlier wins)
- ✅ **Solved count is informational** (doesn't affect ranking)
- ✅ **Real-time updates** ensure accurate rankings
- ✅ **Clear visual display** shows all relevant information

**The system encourages both skill (solving harder challenges) and speed (solving quickly)!** 🎉 