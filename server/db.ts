import mongoose, { Schema } from "mongoose";
const options = { timestamps: true, versionKey: false } as const;
export const Account =
  mongoose.models.PortalAccount ||
  mongoose.model(
    "PortalAccount",
    new Schema(
      {
        id: { type: String, unique: true, required: true },
        login: { type: String, unique: true, required: true },
        hash: { type: String, required: true },
        role: {
          type: String,
          enum: ["admin", "staff", "agent"],
          required: true,
        },
        active: { type: Boolean, default: true },
        data: Schema.Types.Mixed,
      },
      options,
    ),
  );
export const Session =
  mongoose.models.PortalSession ||
  mongoose.model(
    "PortalSession",
    new Schema(
      {
        token: { type: String, unique: true },
        userId: { type: String, index: true },
        expires: { type: Date, expires: 0 },
      },
      options,
    ),
  );
export const Catalog =
  mongoose.models.PortalCatalog ||
  mongoose.model(
    "PortalCatalog",
    new Schema(
      {
        id: { type: String, unique: true, required: true },
        kind: { type: String, index: true },
        data: Schema.Types.Mixed,
      },
      options,
    ),
  );
export const Quotation =
  mongoose.models.PortalQuotation ||
  mongoose.model(
    "PortalQuotation",
    new Schema(
      {
        id: { type: String, unique: true, required: true },
        owner: { type: String, required: true, index: true },
        status: { type: String, enum: ["draft", "generated"] },
        data: Schema.Types.Mixed,
      },
      options,
    ),
  );
export const Media =
  mongoose.models.PortalMedia ||
  mongoose.model(
    "PortalMedia",
    new Schema(
      { id: { type: String, unique: true }, mime: String, bytes: Buffer },
      options,
    ),
  );
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("<db_password>"))
    throw Error("Set MONGODB_URI with the real database password.");
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    dbName: process.env.MONGODB_DB || "curiosity_travel",
  });
  await Promise.all(
    [Account, Session, Catalog, Quotation, Media].map((m) => m.init()),
  );
}
