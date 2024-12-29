import { Document, Schema, model, Types } from "mongoose";

interface IUser extends Document {
  username: string;
  password: string;
}

enum ContentTypes {
  youtube = "youtube",
  tweet = "tweet",
  documents = "documents",
  image = "image",
  video = "video",
  article = "article",
  blog = "blog",
  audio = "audio",
}

interface IContent extends Document {
  title: string;
  link: string;
  type: ContentTypes;
  tags?: Types.ObjectId[];
  userId: Types.ObjectId;
}

interface IShareLink extends Document {
  hash: string;
  userId: IUser;
}

interface ITag extends Document {
  title: string;
}

// userSchema
const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Content Schema

const ContentSchema = new Schema<IContent>({
  title: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(ContentTypes),
    required: true,
  },
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

// Share Links
const ShareLinkSchema = new Schema<IShareLink>({
  hash: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
});

// Tag Schema
const TagSchema = new Schema<ITag>({
  title: {
    type: String,
    required: true,
    unique: true,
  },
});

export const TagModel = model<ITag>("Tag", TagSchema);
export const UserModel = model<IUser>("User", userSchema);
export const ContentModel = model<IContent>("Content", ContentSchema);
export const ShareLinkModel = model<IShareLink>("ShareLink", ShareLinkSchema);
