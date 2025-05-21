'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const http_status_codes_1 = require('http-status-codes');
const productService_1 = __importDefault(require('../services/productService'));
const asyncHandler_1 = __importDefault(require('../utils/asyncHandler'));
class ProductController {
  constructor() {
    this.getSimilarProducts = (0, asyncHandler_1.default)(async (req, res) => {
      const { productId } = req.params;
      const similarProducts = await this.productService.getSimilarProducts(productId);
      return res.status(http_status_codes_1.StatusCodes.OK).json(similarProducts);
    });
    this.productService = new productService_1.default();
  }
}
exports.default = ProductController;
//# sourceMappingURL=productController.js.map
