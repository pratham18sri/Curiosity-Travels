import mongoose from "mongoose";
const uri=process.env.MONGODB_URI;if(!uri)throw new Error("MONGODB_URI is not configured");
const g=global as typeof globalThis&{mongooseCache?:{conn:typeof mongoose|null,promise:Promise<typeof mongoose>|null}};
const c=g.mongooseCache??{conn:null,promise:null};g.mongooseCache=c;
export async function connectDB(){if(c.conn)return c.conn;if(!c.promise)c.promise=mongoose.connect(uri,{bufferCommands:false,dbName:"curiosity_travel"});c.conn=await c.promise;return c.conn}