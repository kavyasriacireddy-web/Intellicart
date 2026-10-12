const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');

// @desc    Get all products with filtering, searching, sorting, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      keyword,
      search,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // 1. Keyword search (Name, Description, Brand, Tags)
    const searchTerm = search || keyword;
    if (searchTerm && searchTerm.trim() !== '') {
      const cleanTerm = searchTerm.trim();
      query.$or = [
        { name: { $regex: cleanTerm, $options: 'i' } },
        { brand: { $regex: cleanTerm, $options: 'i' } },
        { categoryName: { $regex: cleanTerm, $options: 'i' } },
        { subcategory: { $regex: cleanTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(cleanTerm, 'i')] } },
        { description: { $regex: cleanTerm, $options: 'i' } },
      ];
    }

    // 2. Category Filter (by slug, ID, or name)
    if (category && category !== 'all') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const foundCat = await Category.findOne({
          $or: [
            { slug: category.toLowerCase() },
            { name: { $regex: new RegExp(`^${category}$`, 'i') } },
          ],
        });
        if (foundCat) {
          query.category = foundCat._id;
        } else {
          query.categoryName = { $regex: new RegExp(`^${category}$`, 'i') };
        }
      }
    }

    // 3. Subcategory Filter
    if (subcategory && subcategory !== 'all') {
      query.subcategory = { $regex: new RegExp(`^${subcategory}$`, 'i') };
    }

    // 4. Brand Filter (supports comma-separated list e.g. "Apple,Sony")
    if (brand && brand !== 'all') {
      const brandsList = brand.split(',').map((b) => b.trim());
      query.brand = { $in: brandsList.map((b) => new RegExp(`^${b}$`, 'i')) };
    }

    // 5. Price Filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.finalPrice = {};
      if (minPrice !== undefined && !isNaN(minPrice)) {
        query.finalPrice.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(maxPrice)) {
        query.finalPrice.$lte = Number(maxPrice);
      }
    }

    // 6. Rating Filter
    if (rating && !isNaN(rating)) {
      query.rating = { $gte: Number(rating) };
    }

    // 7. Stock Filter
    if (inStock === 'true' || inStock === true) {
      query.stock = { $gt: 0 };
    }

    // 8. Sorting
    let sortOptions = { createdAt: -1 };
    switch (sort) {
      case 'price_asc':
        sortOptions = { finalPrice: 1 };
        break;
      case 'price_desc':
        sortOptions = { finalPrice: -1 };
        break;
      case 'rating_desc':
        sortOptions = { rating: -1, numReviews: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'popular':
        sortOptions = { numReviews: -1, rating: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageLimit;

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(pageLimit);

    // Get distinct brands and price bounds for dynamic filter sidebar
    const brands = await Product.distinct('brand');
    const categories = await Category.find({}, 'name slug itemCount icon');

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      page: pageNum,
      pages: Math.ceil(totalProducts / pageLimit) || 1,
      limit: pageLimit,
      products,
      facets: {
        brands,
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/products/:identifier
// @access  Public
const getProductByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let product = null;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(identifier).populate('category', 'name slug');
    }
    if (!product) {
      product = await Product.findOne({ slug: identifier.toLowerCase() }).populate('category', 'name slug');
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch up to 10 latest reviews
    const reviews = await Review.find({ product: product._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Fetch related products in the same category
    const relatedProducts = await Product.find({
      category: product.category._id || product.category,
      _id: { $ne: product._id },
      stock: { $gt: 0 },
    })
      .limit(4)
      .select('name finalPrice price discount images rating numReviews brand');

    res.status(200).json({
      success: true,
      product,
      reviews,
      relatedProducts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res, next) => {
  try {
    const featured = await Product.find({ isFeatured: true, stock: { $gt: 0 } })
      .limit(8)
      .populate('category', 'name slug');

    // Fallback if none flagged
    if (featured.length === 0) {
      const topRated = await Product.find({ stock: { $gt: 0 } })
        .sort({ rating: -1, numReviews: -1 })
        .limit(8)
        .populate('category', 'name slug');
      return res.status(200).json({ success: true, count: topRated.length, products: topRated });
    }

    res.status(200).json({ success: true, count: featured.length, products: featured });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all unique brands
// @route   GET /api/products/brands
// @access  Public
const getBrands = async (req, res, next) => {
  try {
    const brands = await Product.distinct('brand');
    res.status(200).json({ success: true, brands: brands.sort() });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product (Admin)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      subcategory,
      brand,
      price,
      discount,
      images,
      stock,
      tags,
      specifications,
      isFeatured,
    } = req.body;

    const catDoc = await Category.findById(category);
    if (!catDoc) {
      return res.status(400).json({ success: false, message: 'Invalid category specified' });
    }

    const discountRate = (discount || 0) / 100;
    const finalPrice = Math.round(price * (1 - discountRate) * 100) / 100;

    const product = await Product.create({
      name,
      description,
      category: catDoc._id,
      categoryName: catDoc.name,
      subcategory: subcategory || '',
      brand,
      price,
      discount: discount || 0,
      finalPrice,
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
      stock: stock !== undefined ? stock : 10,
      tags: tags || [],
      specifications: specifications || {},
      isFeatured: Boolean(isFeatured),
    });

    res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.body.category) {
      const cat = await Category.findById(req.body.category);
      if (cat) {
        req.body.categoryName = cat.name;
      }
    }

    // Recalculate finalPrice if price or discount is updated
    const price = req.body.price !== undefined ? req.body.price : product.price;
    const discount = req.body.discount !== undefined ? req.body.discount : product.discount;
    req.body.finalPrice = Math.round(price * (1 - (discount || 0) / 100) * 100) / 100;

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductByIdentifier,
  getFeaturedProducts,
  getBrands,
  createProduct,
  updateProduct,
  deleteProduct,
};
