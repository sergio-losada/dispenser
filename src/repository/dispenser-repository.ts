import { MongoClient, Collection, Document, WithoutId } from 'mongodb';
import { mongoDBAtlasURI, mongoDBAtlasDBName, mongoDBAtlasCollectionName } from '../config';
import { Dispenser } from '../model/dispenser';

class DispenserRepository {
    private client: MongoClient;
    private collection: Collection;

    constructor() {
        this.client = new MongoClient(mongoDBAtlasURI, {
            retryWrites: true,
            w: 'majority',
        });
        this.collection = this.client.db(mongoDBAtlasDBName).collection(mongoDBAtlasCollectionName);
    }

    async connect(): Promise<void> {
        await this.client.connect();
        console.log('Connected to MongoDB Atlas');
    }

    async disconnect(): Promise<void> {
        await this.client.close();
        console.log('MongoDB Atlas connection closed');
    }

    async createDispenser(dispenser: Dispenser) {
        const result = await this.collection.insertOne(dispenser);

        const projection = { _id: 0, status: 0, usages: 0 };
        return await this.collection.findOne({ _id: result.insertedId }, { projection });
    }

    async updateStatus(dispenser: WithoutId<Document>) {
        await this.collection.replaceOne({ id: dispenser.id }, dispenser);
    }

    async getDispenserById(id: string) {
        return await this.collection.findOne({ id: id });
    }

}

export { DispenserRepository };
