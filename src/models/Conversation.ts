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

// Remove the problematic unique index that's causing conflicts
// We'll handle uniqueness in our findOrCreateConversation method instead

// Helper method to find or create a conversation between users
conversationSchema.statics.findOrCreateConversation = async function (
  userIds: string[]
): Promise<IConversation> {
  // Convert to ObjectId and sort consistently
  const sortedUserIds = userIds
    .map((id) => new mongoose.Types.ObjectId(id))
    .sort((a, b) => a.toString().localeCompare(b.toString()));

  // Try to find existing conversation with either order of participants
  let conversation = await this.findOne({
    participants: { $size: sortedUserIds.length, $all: sortedUserIds },
  });

  // Create new conversation if it doesn't exist
  if (!conversation) {
    const unreadCount: Record<string, number> = {};
    sortedUserIds.forEach((userId) => {
      unreadCount[userId.toString()] = 0;
    });

    try {
      conversation = await this.create({
        participants: sortedUserIds,
        unreadCount,
      });
    } catch (error) {
      // In case of a race condition where another request created the conversation
      if ((error as any).code === 11000) {
        conversation = await this.findOne({
          participants: { $size: sortedUserIds.length, $all: sortedUserIds },
        });
        if (!conversation) {
          throw error; // Re-throw if we still can't find it
        }
      } else {
        throw error; // Re-throw non-duplicate errors
      }
    }
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
