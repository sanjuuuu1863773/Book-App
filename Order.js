const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
    },
    userName: {
      type: String,
      required: [true, 'User name is required'],
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
    },
    bookId: {
      type: String,
      required: [true, 'Book ID is required'],
    },
    bookTitle: {
      type: String,
      required: [true, 'Book title is required'],
    },
    bookAuthor: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 1,
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'confirmed',
    },
    shippingAddress: {
      type: String,
      default: 'Not provided',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
