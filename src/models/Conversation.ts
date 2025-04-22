// models/Conversation.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  unreadCount: {
    [key: string]: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    unreadCount: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Create a compound index for participants to ensure unique conversations between the same users
conversationSchema.index(
  { participants: 1 },
  {
    unique: true,
    // This makes MongoDB consider the array elements order-independent
    // So [user1, user2] is treated the same as [user2, user1]
    partialFilterExpression: { participants: { $size: 2 } },
  }
);

// Helper method to find or create a conversation between users
conversationSchema.statics.findOrCreateConversation = async function (
  userIds: string[]
): Promise<IConversation> {
  const sortedUserIds = userIds
    .map((id) => new mongoose.Types.ObjectId(id))
    .sort((a, b) => a.toString().localeCompare(b.toString()));

  // Try to find existing conversation
  let conversation = await this.findOne({
    participants: { $all: sortedUserIds },
  });

  // Create new conversation if it doesn't exist
  if (!conversation) {
    const unreadCount: Record<string, number> = {};
    sortedUserIds.forEach((userId) => {
      unreadCount[userId.toString()] = 0;
    });

    conversation = await this.create({
      participants: sortedUserIds,
      unreadCount,
    });
  }

  return conversation;
};

// Add static methods to the model interface
interface ConversationModel extends Model<IConversation> {
  findOrCreateConversation(userIds: string[]): Promise<IConversation>;
}

const Conversation =
  (mongoose.models.Conversation as ConversationModel) ||
  mongoose.model<IConversation, ConversationModel>(
    "Conversation",
    conversationSchema
  );

export default Conversation;
