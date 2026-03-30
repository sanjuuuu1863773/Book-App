require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');

const books = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    price: 12.99,
    description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
    category: 'Fiction',
    stock: 25,
    isbn: '978-0743273565',
    publisher: 'Scribner',
    publishedYear: 1925,
    rating: 4.1,
    coverImage: 'https://covers.openlibrary.org/b/id/8432472-L.jpg',
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    price: 14.99,
    description: 'A gripping tale of racial injustice and childhood innocence set in Alabama during the 1930s.',
    category: 'Fiction',
    stock: 18,
    isbn: '978-0061935466',
    publisher: 'HarperCollins',
    publishedYear: 1960,
    rating: 4.3,
    coverImage: 'https://covers.openlibrary.org/b/id/8314978-L.jpg',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    price: 39.99,
    description: 'A handbook of agile software craftsmanship. Learn to write code that is readable, understandable, and maintainable.',
    category: 'Technology',
    stock: 30,
    isbn: '978-0132350884',
    publisher: 'Prentice Hall',
    publishedYear: 2008,
    rating: 4.5,
    coverImage: 'https://covers.openlibrary.org/b/id/11048578-L.jpg',
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    price: 16.99,
    description: 'An exploration of the universe from the Big Bang to black holes, written for the layperson.',
    category: 'Science',
    stock: 22,
    isbn: '978-0553380163',
    publisher: 'Bantam Books',
    publishedYear: 1988,
    rating: 4.4,
    coverImage: 'https://covers.openlibrary.org/b/id/8406786-L.jpg',
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    price: 18.99,
    description: 'An easy and proven way to build good habits and break bad ones.',
    category: 'Self-Help',
    stock: 45,
    isbn: '978-0735211292',
    publisher: 'Avery',
    publishedYear: 2018,
    rating: 4.8,
    coverImage: 'https://covers.openlibrary.org/b/id/10302951-L.jpg',
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    price: 13.99,
    description: 'A young hobbit Bilbo Baggins is swept into an epic quest for a treasure guarded by a dragon.',
    category: 'Fantasy',
    stock: 35,
    isbn: '978-0547928227',
    publisher: 'Houghton Mifflin',
    publishedYear: 1937,
    rating: 4.7,
    coverImage: 'https://covers.openlibrary.org/b/id/8406786-L.jpg',
  },
  {
    title: 'Becoming',
    author: 'Michelle Obama',
    price: 22.99,
    description: "An intimate, powerful, and inspiring memoir by the former First Lady of the United States.",
    category: 'Biography',
    stock: 20,
    isbn: '978-1524763138',
    publisher: 'Crown',
    publishedYear: 2018,
    rating: 4.6,
    coverImage: 'https://covers.openlibrary.org/b/id/9256247-L.jpg',
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    price: 19.99,
    description: 'A bold exploration of human history, from primitive cave-dwellers to modern-day civilization.',
    category: 'History',
    stock: 28,
    isbn: '978-0062316097',
    publisher: 'Harper',
    publishedYear: 2011,
    rating: 4.4,
    coverImage: 'https://covers.openlibrary.org/b/id/9302615-L.jpg',
  },
  {
    title: 'The Da Vinci Code',
    author: 'Dan Brown',
    price: 15.99,
    description: 'A murder at the Louvre Museum and clues in classic Da Vinci paintings lead a professor on a thrilling adventure.',
    category: 'Mystery',
    stock: 15,
    isbn: '978-0307474278',
    publisher: 'Anchor',
    publishedYear: 2003,
    rating: 3.9,
    coverImage: 'https://covers.openlibrary.org/b/id/8414834-L.jpg',
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'David Thomas & Andrew Hunt',
    price: 44.99,
    description: 'From journeyman to master — essential advice for software developers.',
    category: 'Technology',
    stock: 12,
    isbn: '978-0201616224',
    publisher: 'Addison-Wesley',
    publishedYear: 1999,
    rating: 4.6,
    coverImage: 'https://covers.openlibrary.org/b/id/8408734-L.jpg',
  },
];

async function seedBooks() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Book.deleteMany({});
    console.log('🗑️  Cleared existing books');

    const inserted = await Book.insertMany(books);
    console.log(`\n📚 Successfully seeded ${inserted.length} books:\n`);
    inserted.forEach((b, i) => {
      console.log(`   ${i + 1}. ${b.title} — ${b.author} ($${b.price})`);
    });

    console.log('\n✅ Book seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seedBooks();
