const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Self-Help', 'Fantasy', 'Mystery', 'Romance', 'Other'],
    },
    stock: {
      type: Number,
      default: 10,
      min: 0,
    },
    coverImage: {
      type: String,
      default: '',
    },
    isbn: {
      type: String,
      default: '',
    },
    publisher: {
      type: String,
      default: '',
    },
    publishedYear: {
      type: Number,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
