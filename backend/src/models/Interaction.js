const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      index: true,
      default: null,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'PRODUCT_VIEW',
        'SEARCH',
        'CATEGORY_VIEW',
        'WISHLIST',
        'ADD_TO_CART',
        'REMOVE_FROM_CART',
        'PURCHASE',
        'RATING',
        'REVIEW',
      ],
      index: true,
    },
    weight: {
      type: Number,
      default: 1,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Map default weights according to collaborative filtering heuristics
interactionSchema.pre('save', function (next) {
  if (!this.weight || this.weight === 1) {
    switch (this.action) {
      case 'PRODUCT_VIEW':
        this.weight = 1;
        break;
      case 'SEARCH':
        this.weight = 2;
        break;
      case 'CATEGORY_VIEW':
        this.weight = 1.5;
        break;
      case 'WISHLIST':
        this.weight = 3;
        break;
      case 'ADD_TO_CART':
        this.weight = 4;
        break;
      case 'PURCHASE':
        this.weight = 5;
        break;
      case 'RATING':
        this.weight = this.metadata?.rating ? Number(this.metadata.rating) : 3;
        break;
      case 'REVIEW':
        this.weight = 4.5;
        break;
      default:
        this.weight = 1;
    }
  }
  next();
});

// Compound indexes for recommendation calculation queries
interactionSchema.index({ userId: 1, action: 1 });
interactionSchema.index({ userId: 1, productId: 1 });
interactionSchema.index({ productId: 1, action: 1 });
interactionSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Interaction', interactionSchema);
