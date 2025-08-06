const fs = require('fs');
const path = require('path');

// Local database using JSON files
const DB_PATH = path.join(__dirname, '../../data');

// Ensure data directory exists
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true });
}

// Initialize collections
const collections = ['teams', 'challenges', 'submissions', 'leaderboard', 'notifications'];

collections.forEach(collection => {
  const filePath = path.join(DB_PATH, `${collection}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }
});

// Helper functions
const readCollection = (collectionName) => {
  try {
    const filePath = path.join(DB_PATH, `${collectionName}.json`);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${collectionName}:`, error);
    return [];
  }
};

const writeCollection = (collectionName, data) => {
  try {
    const filePath = path.join(DB_PATH, `${collectionName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${collectionName}:`, error);
    return false;
  }
};

// Mock Firestore-like interface
const localDb = {
  collection: (collectionName) => ({
    // Get all documents
    get: async () => {
      const data = readCollection(collectionName);
      return {
        forEach: (callback) => {
          data.forEach((doc, index) => {
            callback({
              id: doc.id || `doc_${index}`,
              data: () => doc,
              ref: { id: doc.id || `doc_${index}` }
            });
          });
        }
      };
    },

    // Add document
    add: async (data) => {
      const collection = readCollection(collectionName);
      const newDoc = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        createdAt: new Date().toISOString()
      };
      collection.push(newDoc);
      writeCollection(collectionName, collection);
      return { id: newDoc.id };
    },

    // Get document by ID
    doc: (id) => ({
      get: async () => {
        const collection = readCollection(collectionName);
        const doc = collection.find(d => d.id === id);
        return {
          exists: !!doc,
          data: () => doc,
          id: doc?.id
        };
      },

      set: async (data) => {
        const collection = readCollection(collectionName);
        const existingIndex = collection.findIndex(d => d.id === id);
        
        if (existingIndex >= 0) {
          collection[existingIndex] = { ...collection[existingIndex], ...data };
        } else {
          collection.push({ id, ...data });
        }
        
        writeCollection(collectionName, collection);
        return { id };
      },

      update: async (data) => {
        const collection = readCollection(collectionName);
        const existingIndex = collection.findIndex(d => d.id === id);
        
        if (existingIndex >= 0) {
          collection[existingIndex] = { ...collection[existingIndex], ...data };
          writeCollection(collectionName, collection);
          return { id };
        } else {
          throw new Error('Document not found');
        }
      },

      delete: async () => {
        const collection = readCollection(collectionName);
        const filtered = collection.filter(d => d.id !== id);
        writeCollection(collectionName, filtered);
        return { id };
      }
    }),

    // Query documents
    where: (field, operator, value) => ({
      get: async () => {
        const collection = readCollection(collectionName);
        const filtered = collection.filter(doc => {
          switch (operator) {
            case '==':
              return doc[field] === value;
            case '!=':
              return doc[field] !== value;
            case '>':
              return doc[field] > value;
            case '<':
              return doc[field] < value;
            case '>=':
              return doc[field] >= value;
            case '<=':
              return doc[field] <= value;
            default:
              return true;
          }
        });
        
        return {
          forEach: (callback) => {
            filtered.forEach((doc, index) => {
              callback({
                id: doc.id || `doc_${index}`,
                data: () => doc,
                ref: { id: doc.id || `doc_${index}` }
              });
            });
          }
        };
      }
    }),

    // Order by
    orderBy: (field, direction = 'asc') => ({
      get: async () => {
        const collection = readCollection(collectionName);
        const sorted = collection.sort((a, b) => {
          const aVal = a[field];
          const bVal = b[field];
          
          if (direction === 'desc') {
            return bVal > aVal ? 1 : -1;
          }
          return aVal > bVal ? 1 : -1;
        });
        
        return {
          forEach: (callback) => {
            sorted.forEach((doc, index) => {
              callback({
                id: doc.id || `doc_${index}`,
                data: () => doc,
                ref: { id: doc.id || `doc_${index}` }
              });
            });
          }
        };
      }
    })
  }),

  batch: () => ({
    set: (ref, data) => {
      // For now, just write directly
      const collectionName = ref.path.split('/')[0];
      const collection = readCollection(collectionName);
      const existingIndex = collection.findIndex(d => d.id === ref.id);
      
      if (existingIndex >= 0) {
        collection[existingIndex] = { ...collection[existingIndex], ...data };
      } else {
        collection.push({ id: ref.id, ...data });
      }
      
      writeCollection(collectionName, collection);
    },
    
    update: (ref, data) => {
      const collectionName = ref.path.split('/')[0];
      const collection = readCollection(collectionName);
      const existingIndex = collection.findIndex(d => d.id === ref.id);
      
      if (existingIndex >= 0) {
        collection[existingIndex] = { ...collection[existingIndex], ...data };
        writeCollection(collectionName, collection);
      }
    },
    
    delete: (ref) => {
      const collectionName = ref.path.split('/')[0];
      const collection = readCollection(collectionName);
      const filtered = collection.filter(d => d.id !== ref.id);
      writeCollection(collectionName, filtered);
    },
    
    commit: async () => {
      // All operations are already committed
      return true;
    }
  })
};

module.exports = { localDb }; 