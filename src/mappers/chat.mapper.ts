import mongoose from "mongoose";
import { Conversation, LastMessage, Participant, PopulatedConversation, PopulatedParticipant, PopulatedUser } from "../dtos/chat.dto";

export class ConversationMapper {
  
  // 🔥 Main mapper
  static toConversation(conv: PopulatedConversation): Conversation {
    return {
      _id: conv._id.toString(),
      jobId: conv.jobId?.toString(),
      applicationId: conv.applicationId?.toString(),
      initiatedBy: conv.initiatedBy.toString(),
      status: conv.status,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),

      lastMessage: this.mapLastMessage(conv.lastMessage),

      participants: conv.participants.map((p) =>
        this.mapParticipant(p)
      ),
    };
  }

  static toConversationList(convs: PopulatedConversation[]): Conversation[] {
    return convs.map((c) => this.toConversation(c));
  }

  private static mapParticipant(p: PopulatedParticipant): Participant {
    const user = this.extractUser(p.userId);

    return {
      userId: user.id,
      userType: p.userType,
      lastReadAt: p.lastReadAt.toISOString(),
      unreadCount: p.unreadCount,

      participantName:
        p.userType === "Company"
          ? user.name ?? "Company"
          : user.fullName ?? "User",

      participantAvatar: user.avatar ?? "",
    };
  }

  private static mapLastMessage(
    msg?: PopulatedConversation["lastMessage"]
  ): LastMessage | undefined {
    if (!msg) return undefined;

    return {
      content: msg.content,
      senderId: msg.senderId.toString(),
      createdAt: msg.createdAt.toISOString(),
      messageType: msg.messageType,
    };
  }

  private static extractUser(
    user: PopulatedUser | mongoose.Types.ObjectId
  ): {
    id: string;
    name?: string;
    fullName?: string;
    avatar?: string;
  } {
    if (user instanceof mongoose.Types.ObjectId) {
      return {
        id: user.toString(),
      };
    }

    return {
      id: user._id.toString(),
      name: user.name,
      fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
      avatar: user.profilePicture?.location,
    };
  }
}