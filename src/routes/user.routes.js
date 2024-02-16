import { Router } from "express";
import { logOutUser, loginUser, registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js"
import { ApiErrors } from "../utils/ApiErrors.js"
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name :"coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)  

// save
router.route("logOut").post(logOutUser)

export default router