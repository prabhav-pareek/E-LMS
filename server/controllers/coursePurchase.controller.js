import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;

    if (!userId) {
      console.log("❌ req.id is undefined (user not logged in)");
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!" });

    const dummyPaymentId = `DUMMY_PAYMENT_${Date.now()}`;

    const purchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "completed",
      paymentId: dummyPaymentId,
    });

    await purchase.save();

    if (course.lectures.length > 0) {
      await Lecture.updateMany(
        { _id: { $in: course.lectures } },
        { $set: { isPreviewFree: true } }
      );
    }

    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: course._id },
    });

    await Course.findByIdAndUpdate(course._id, {
      $addToSet: { enrolledStudents: userId },
    });

    return res.status(200).json({
      success: true,
      message: "Dummy payment completed.",
    });
  } catch (error) {
    console.log("💥 createCheckoutSession error:", error);
    return res
      .status(500)
      .json({ message: "Already Enrolled! Internal Server Error" });
  }
};

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    const purchased = await CoursePurchase.findOne({ userId, courseId });

    if (!course) {
      return res.status(404).json({ message: "course not found!" });
    }

    return res.status(200).json({
      course,
      purchased: !!purchased,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllPurchasedCourse = async (_, res) => {
  try {
    const purchasedCourse = await CoursePurchase.find({
      status: "completed",
    }).populate("courseId");
    if (!purchasedCourse) {
      return res.status(404).json({ purchasedCourse: [] });
    }
    return res.status(200).json({ purchasedCourse });
  } catch (error) {
    console.log(error);
  }
};
