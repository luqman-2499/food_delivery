import mongoose from 'mongoose'

const deliveryAssignmentSchema = new mongoose.Schema ({

    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },

    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    },
    // We get ShopOrderId from shcema of shopOrder inside Order model since we take within a main Order model we didnt specify type as order
    shopOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    // Owner Updates Status 'Out For Delivery' sends Notifcaation to multiple Delivery Persons so Array
    brodcastedTo: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],

    // Who Accepted the Delivery 
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default:null  // Initially null as no order is sent yet ! 
    },

    status: {
        type: String,
        enum: ['brodcasted', 'assigned', 'completed'],
        default: 'brodcasted'
    },

    acceptedAt: Date

}, {timestamps: true})

const DeliveryAssignment = mongoose.model('DeliveryAssignment', deliveryAssignmentSchema)

export default DeliveryAssignment