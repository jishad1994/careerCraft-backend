//adrress schema

import { Schema } from "mongoose";
import { IAddress } from "../user/user.interface";

export const addressSchema = new Schema<IAddress>({
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    postalCode: {
        type: String,
        required: true,
    },
});