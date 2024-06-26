import Order from "../models/orderModel.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import httpStatusText from "../utils/httpStatusText.js";
import appError from "../utils/appError.js";
import Product from "../models/productModel.js";
import SalesReport from "../models/salesReportModel.js";

// Create new order
export const createOrder = asyncWrapper(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    totalQuantity,
  } = req.body;

  if (
    !shippingInfo ||
    !orderItems ||
    !paymentInfo ||
    !itemsPrice ||
    !taxPrice ||
    !shippingPrice ||
    !totalPrice ||
    !totalQuantity
  ) {
    return next(new appError("All fields are required", 400));
  }

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    totalQuantity,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  const total = itemsPrice;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const currentDate = new Date().toISOString().split("T")[0];

  // البحث عن التقرير السنوي
  let salesReport = await SalesReport.findOne({ year: currentYear });

  if (!salesReport) {
    // إذا لم يكن هناك تقرير لهذا العام، قم بإنشاء تقرير جديد
    salesReport = await SalesReport.create({
      yearlySalesTotal: total,
      yearlyTotalSoldUnits: totalQuantity,
      year: currentYear,
      monthlyData: [
        {
          month: currentMonth,
          totalSales: total,
          totalUnits: totalQuantity,
        },
      ],
      dailyData: [
        {
          date: currentDate,
          totalSales: total,
          totalUnits: totalQuantity,
        },
      ],
    });
  } else {
    // في حالة وجود تقرير لهذا العام، قم بتحديث البيانات
    salesReport.yearlySalesTotal += total;
    salesReport.yearlyTotalSoldUnits += totalQuantity;

    let monthData = salesReport.monthlyData.find(
      (data) => data.month === currentMonth
    );
    if (!monthData) {
      monthData = {
        month: currentMonth,
        totalSales: 0,
        totalUnits: 0,
      };
      salesReport.monthlyData.push(monthData);
    }
    monthData.totalSales += total;
    monthData.totalUnits += totalQuantity;

    let dayData = salesReport.dailyData.find(
      (data) => data.date === currentDate
    );
    if (!dayData) {
      dayData = {
        date: currentDate,
        totalSales: 0,
        totalUnits: 0,
      };
      salesReport.dailyData.push(dayData);
    }
    dayData.totalSales += total;
    dayData.totalUnits += totalQuantity;

    await salesReport.save();
  }

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    order,
  });
});

// Get one order
export const getSingleOrder = asyncWrapper(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new appError("Order not found with this id", 404));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    order,
  });
});

// Get user's orders
export const myOrders = asyncWrapper(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    orders,
  });
});

// Get all orders (for Admin)
export const getAllOrders = asyncWrapper(async (req, res, next) => {
  const orders = await Order.find().populate("user", "name email");

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    orders,
  });
});

// Function to update stock
async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  if (!product) {
    throw new Error(`Product with id ${id} not found`);
  }
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

// Update orders (for Admin)
export const updateOrders = asyncWrapper(async (req, res, next) => {
  const orderId = req.params.id;

  const order = await Order.findById(orderId);

  if (order.orderStatus === "Delivered") {
    return next(new appError("This order has already been delivered", 400));
  }
  if (!order) {
    return next(new appError("Order not found with this id", 404));
  }

  try {
    for (const orderItem of order.orderItems) {
      const productId = orderItem._id;
      const quantity = orderItem.quantity;
      await updateStock(productId, quantity);
    }
  } catch (error) {
    return next(
      new appError(`Failed to update the order: ${error.message}`, 400)
    );
  }

  order.orderStatus = req.body.status;

  if (order.orderStatus === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    order,
  });
});

// Delete order (for Admin)
export const deleteOrder = asyncWrapper(async (req, res, next) => {
  const deletedOrder = await Order.findById(req.params.id);

  if (!deletedOrder) {
    return next(new appError("Order not found with this id", 404));
  }

  await deletedOrder.deleteOne();

  res.status(204).json({
    status: httpStatusText.SUCCESS,
  });
});
