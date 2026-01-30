const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    clientId: { type: String, required: true }, // ID користувача (з Auth сервісу)
    phoneModel: { type: String, required: true },
    purchaseDate: { type: Date },
    osVersion: { type: String },
    description: { type: String, required: true },
    technicianComment: { type: String },
    status: {
        type: String,
        enum: ['new', 'in progress', 'waiting customer response', 'waiting spare parts', 'failed', 'done'],
        default: 'new'
    },
    historyLog: [{
        status: String,
        changedAt: { type: Date, default: Date.now },
        comment: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
