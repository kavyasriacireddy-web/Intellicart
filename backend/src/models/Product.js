const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please enter product description'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category'],
    },
    categoryName: {
      type: String,
      required: true,
      index: true,
    },
    subcategory: {
      type: String,
      default: '',
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Please specify product brand'],
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      min: [0, 'Price cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    finalPrice: {
      type: Number,
      required: true,
      min: [0, 'Final price cannot be negative'],
    },
    images: {
      type: [String],
      required: [true, 'Please provide at least one product image'],
      validate: [val => val.length > 0, 'At least one image is required'],
    },
    stock: {
      type: Number,
      required: [true, 'Please enter product stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 10,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    numReviews: {
      type: Number,
      default: 0,
      min: [0, 'Number of reviews cannot be negative'],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate finalPrice and slug before validation
productSchema.pre('validate', function (next) {
  if (this.price !== undefined) {
    const discountRate = (this.discount || 0) / 100;
    this.finalPrice = Math.round(this.price * (1 - discountRate) * 100) / 100;
  }
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  }
  next();
});

// Compound and text indexes for rapid search, filtering, and collaborative ranking
productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });
productSchema.index({ categoryName: 1, finalPrice: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
