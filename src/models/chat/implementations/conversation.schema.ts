// conversation.schema.ts
import mongoose, { Model, Schema } from "mongoose";
import { IchatParticipant, IConversation, IConversationMethods } from "../interfaces/conversation.interface";

type ConversationModel = Model<IConversation, IConversationMethods>;

const participantSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: "participants.userType",
        },
        userType: {
            type: String,
            enum: ["User", "Company"],
            required: true,
        },
        lastReadAt: {
            type: Date,
            default: Date.now,
        },
        unreadCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { _id: false },
);

const lastMessageSchema = new Schema(
    {
        content: String,
        senderId: Schema.Types.ObjectId,
        createdAt: Date,
        messageType: {
            type: String,
            enum: ["text", "file", "system"],
        },
    },
    { _id: false },
);

const conversationSchema = new Schema<IConversation, ConversationModel, IConversationMethods>(
    {
        participants: {
            type: [participantSchema],
            required: true,
            validate: {
                validator: function (participants: IchatParticipant[]) {
                    return participants.length === 2;
                },
                message: "Conversation must have exactly 2 participants",
            },
        },
        jobId: {
            type: Schema.Types.ObjectId,
            ref: "Job",
            index: true,
        },
        applicationId: {
            type: Schema.Types.ObjectId,
            ref: "Application",
            index: true,
        },
        lastMessage: lastMessageSchema,
        initiatedBy: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["active", "archived", "blocked"],
            default: "active",
            index: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

conversationSchema.index({ "participants.userId": 1 });

// Instance Methods
conversationSchema.methods.getOtherParticipant = function (currentUserId: string) {
    return this.participants.find((p) => p.userId.toString() !== currentUserId);
};

export const Conversation: ConversationModel = mongoose.model<IConversation, ConversationModel>(
    "Conversation",
    conversationSchema,
);
