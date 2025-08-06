# 🔥 Firebase Setup Guide - New Project

## **📋 Step-by-Step Instructions**

### **1. Create New Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `gitxtribe-ctf-v2` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click **"Create project"**

### **2. Enable Firestore Database**
1. In your project dashboard, click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select a location (choose closest to you)
5. Click **"Done"**

### **3. Get Service Account Credentials**
1. Go to **Project Settings** (gear icon in top left)
2. Click **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Download the JSON file
5. **Keep this file secure!**

### **4. Update Environment Variables**

Create a new `.env` file in the root directory with your new Firebase credentials:

```env
# Firebase Configuration (Frontend)
REACT_APP_FIREBASE_API_KEY=your_new_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_new_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_new_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_new_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Server-side Firebase Admin SDK (Backend)
FIREBASE_PROJECT_ID=your_new_project_id
FIREBASE_PRIVATE_KEY_ID=your_new_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour new private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_new_project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_new_client_id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your_new_project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your_new_project.appspot.com

# Server Configuration
PORT=5000
NODE_ENV=development

# Admin Credentials
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=pavanrocks
```

### **5. Extract Values from Service Account JSON**

Open your downloaded service account JSON file and extract these values:

```json
{
  "type": "service_account",
  "project_id": "YOUR_PROJECT_ID",
  "private_key_id": "YOUR_PRIVATE_KEY_ID",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@YOUR_PROJECT.iam.gserviceaccount.com",
  "client_id": "YOUR_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40YOUR_PROJECT.iam.gserviceaccount.com"
}
```

### **6. Get Frontend Firebase Config**

1. In Firebase Console, go to **Project Settings**
2. Click **"General"** tab
3. Scroll down to **"Your apps"**
4. Click **"Add app"** → **"Web"**
5. Register app and copy the config values

### **7. Update Your .env File**

Replace the placeholder values with your actual Firebase credentials:

```env
# Example with real values:
FIREBASE_PROJECT_ID=gitxtribe-ctf-v2
FIREBASE_PRIVATE_KEY_ID=abc123def456
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@gitxtribe-ctf-v2.iam.gserviceaccount.com
```

### **8. Restart Your Application**

After updating the `.env` file:

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

## **✅ Verification Steps**

1. **Check Server Logs**: Should see "✅ Firebase initialized successfully"
2. **Test Login**: Try logging in with existing teams
3. **Test Challenges**: Verify challenges load correctly
4. **Test Submissions**: Submit a flag to test database writes

## **🔧 Troubleshooting**

### **If you see "Quota exceeded" errors:**
- Make sure you're using the new Firebase project
- Check that all environment variables are updated
- Restart the server after updating `.env`

### **If Firebase doesn't initialize:**
- Double-check your service account credentials
- Ensure the private key is properly formatted with `\n` characters
- Verify the project ID matches in all variables

### **If you get authentication errors:**
- Make sure Firestore is in "test mode"
- Check that the service account has proper permissions

## **🎯 Quick Test**

After setup, test with these credentials:
- **Team**: Team Alpha, **Password**: password123
- **Admin**: Admin, **Password**: pavanrocks

## **📞 Need Help?**

If you encounter any issues:
1. Check the server console for error messages
2. Verify all environment variables are set correctly
3. Make sure the Firebase project is properly configured

**Your CTF platform should work perfectly with the new Firebase project!** 🚀 