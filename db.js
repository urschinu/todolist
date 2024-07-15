import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017';

const client = new MongoClient(uri);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        return client.db('Todolist');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

export  { connectToDatabase };