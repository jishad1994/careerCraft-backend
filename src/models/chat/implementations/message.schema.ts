
import mongoose, { Model, Schema } from "mongoose";
import { IMessage, MessageStatus, MessageType } from "../interfaces/message.interface";


const attachmentSchema = new Schema(
    {
        fileUrl: {
            type: String,
            required: true,
        },
        fileName: {
            type: String,
            required: true,
        },
        fileSize: {
            type: Number,
            required: true,
        },
        fileType: {
            type: String,
            required: true,
        },
        s3Key: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);

const messageSchema = new Schema<IMessage>(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true,
        },
        senderId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        senderType: {
            type: String,
            enum: ['User', 'Company'],
            required: true,
        },
        receiverId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        receiverType: {
            type: String,
            enum: ['User', 'Company'],
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 5000,
        },
        messageType: {
            type: String,
            enum: Object.values(MessageType),
            default: MessageType.TEXT,
        },
        attachments: {
            type: [attachmentSchema],
            default: [],
        },
        status: {
            type: String,
            enum: Object.values(MessageStatus),
            default: MessageStatus.SENT,
            index: true,
        },
        readBy: {
            type: [Schema.Types.ObjectId],
            default: [],
        },
        deliveredAt: {
            type: Date,
        },
        readAt: {
            type: Date,
        },
        isEdited: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Compound indexes for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, isDeleted: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, status: 1 });

// Pre-save middleware
messageSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        if (this.status === MessageStatus.DELIVERED && !this.deliveredAt) {
            this.deliveredAt = new Date();
        }
        if (this.status === MessageStatus.READ && !this.readAt) {
            this.readAt = new Date();
        }
    }
    
    if (this.isModified('isDeleted') && this.isDeleted && !this.deletedAt) {
        this.deletedAt = new Date();
    }
    
    next();
});

// Static methods
messageSchema.statics.findByConversation = function (
    conversationId: string,
    page: number = 1,
    limit: number = 50
) {
    return this.find({
        conversationId,
        isDeleted: false,
    })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
};

messageSchema.statics.countUnread = function (conversationId: string, userId: string) {
    return this.countDocuments({
        conversationId,
        receiverId: userId,
        status: { $ne: MessageStatus.READ },
        isDeleted: false,
    });
};

messageSchema.statics.markAsDelivered = function (messageIds: string[]) {
    return this.updateMany(
        {
            _id: { $in: messageIds },
            status: MessageStatus.SENT,
        },
        {
            $set: {
                status: MessageStatus.DELIVERED,
                deliveredAt: new Date(),
            },
        }
    );
};

messageSchema.statics.markAsRead = function (messageIds: string[], userId: string) {
    return this.updateMany(
        {
            _id: { $in: messageIds },
            receiverId: userId,
            status: { $ne: MessageStatus.READ },
        },
        {
            $set: {
                status: MessageStatus.READ,
                readAt: new Date(),
            },
            $addToSet: { readBy: userId },
        }
    );
};

export const Message: Model<IMessage> = mongoose.model<IMessage>("Message", messageSchema);