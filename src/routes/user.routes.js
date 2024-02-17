import { Router } from "express";
import { logOutUser, loginUser, refreshAccessToken, registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js"
import { ApiErrors } from "../utils/ApiErrors.js"
import { verify } from "jsonwebtoken";
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

// SECURED ROUTE
router.route("logOut").post(verifyJWT , logOutUser)
router.route("/refresh-token").post(refreshAccessToken)
export default router