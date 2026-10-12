const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories with dynamic item counts
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    
    // Refresh item count asynchronously
    const counts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const enriched = categories.map((cat) => ({
      ...cat.toObject(),
      itemCount: countMap[cat._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      count: enriched.length,
      categories: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by slug or id
// @route   GET /api/categories/:identifier
// @access  Public
const getCategoryByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let category = null;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(identifier);
    }
    if (!category) {
      category = await Category.findOne({ slug: identifier.toLowerCase() });
    }

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category (Admin)
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, icon } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({ name, description, image, icon });
    res.status(201).json({ success: true, message: 'Category created', category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category (Admin)
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, message: 'Category updated', category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category (Admin)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if products exist in category
    const hasProducts = await Product.exists({ category: category._id });
    if (hasProducts) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category containing active products. Reassign or delete products first.',
      });
    }

    await category.deleteOne();
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryByIdentifier,
  createCategory,
  updateCategory,
  deleteCategory,
};
