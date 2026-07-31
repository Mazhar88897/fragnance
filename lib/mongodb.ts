import { MongoClient, Db, type Collection } from "mongodb";

const uri = process.env.MONGODB_URI;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("Missing MONGODB_URI in environment");
  }
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 20000,
    family: 4,
  });
  return client.connect();
}

function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    global._mongoClientPromise ??= createClientPromise();
    return global._mongoClientPromise;
  }
  return createClientPromise();
}

export async function getDb(dbName = "fragnance"): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}

export type ConnectionTestDoc = {
  _id?: import("mongodb").ObjectId;
  title: string;
  body: string | null;
  created_at: Date;
  updated_at: Date;
};

export async function getConnectionTestsCollection(): Promise<
  Collection<ConnectionTestDoc>
> {
  const db = await getDb();
  return db.collection<ConnectionTestDoc>("connection_tests");
}

export type NamedEntityDoc = {
  _id?: import("mongodb").ObjectId;
  name: string;
  description: string | null;
};

export async function getNamedEntityCollection(
  name: "scent_type" | "occasion"
): Promise<Collection<NamedEntityDoc>> {
  const db = await getDb();
  return db.collection<NamedEntityDoc>(name);
}

export type AssociateLink = {
  name: string;
  link: string;
};

export type FragranceDoc = {
  _id?: import("mongodb").ObjectId;
  name: string;
  brand: string;
  occasion: import("mongodb").ObjectId[];
  scent_type: import("mongodb").ObjectId[];
  associate_links: AssociateLink[];
  created_at: Date;
  updated_at: Date;
};

export async function getFragrancesCollection(): Promise<
  Collection<FragranceDoc>
> {
  const db = await getDb();
  return db.collection<FragranceDoc>("fragrances");
}

export type ReviewDoc = {
  _id?: import("mongodb").ObjectId;
  fragrance_id: import("mongodb").ObjectId;
  name: string;
  review: string;
  approval: boolean;
  rating: number;
  created_at: Date;
  updated_at: Date;
};

export async function getReviewsCollection(): Promise<Collection<ReviewDoc>> {
  const db = await getDb();
  return db.collection<ReviewDoc>("reviews");
}

export type BlogDoc = {
  _id?: import("mongodb").ObjectId;
  title: string;
  provider: string;
  description: string;
  author: string;
  created_at: Date;
  updated_at: Date;
};

export async function getBlogsCollection(): Promise<Collection<BlogDoc>> {
  const db = await getDb();
  return db.collection<BlogDoc>("blogs");
}
