

import mongoose, { Model, Schema } from 'mongoose';
import { ICallParticipant, ICallSession } from './call.session.interface';


const CallParticipantSchema = new Schema<ICallParticipant>({
  userId: { type: String, required: true },
  role: { type: String, enum: ['user', 'company'], required: true },
  socketId: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
  leftAt: Date,
  status: {
    type: String,
    enum: ['waiting', 'connected', 'disconnected'],
    default: 'waiting',
  },
}, { _id: false });

const CallSessionSchema = new Schema<ICallSession>({
  interviewId: {
    type: Schema.Types.ObjectId,
    ref: 'JobApplication',
    required: true,
    index: true,
  },
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'JobApplication',
    required: true,
    index: true,
  },
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  participants: [CallParticipantSchema],
  callType: {
    type: String,
    enum: ['video', 'audio'],
    required: true,
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'ended'],
    default: 'waiting',
    index: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: Date,
  duration: Number,
  recordingUrl: String,
}, { timestamps: true });

// Calculate duration before saving
CallSessionSchema.pre('save', function(next) {
  if (this.endedAt && this.startedAt) {
    this.duration = Math.floor((this.endedAt.getTime() - this.startedAt.getTime()) / 1000);
  }
  next();
});

// Index for finding active sessions
CallSessionSchema.index({ status: 1, interviewId: 1 });

export const CallSession: Model<ICallSession> = mongoose.model<ICallSession>(
  'CallSession',
  CallSessionSchema
);