'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = require('express');
const productController_1 = __importDefault(require('../controllers/productController'));
const router = (0, express_1.Router)();
const productController = new productController_1.default();
router.get('/:productId/similar', productController.getSimilarProducts);
exports.default = router;
//# sourceMappingURL=productRoutes.js.map
