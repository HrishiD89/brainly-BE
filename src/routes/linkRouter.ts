import express from "express";
const router = express.Router({ mergeParams: true });
import { ShareLinkModel,ContentModel } from "../db/db";
import { userMiddleware } from "../middleware/userMiddleware";
import { random } from "../utils";

router.post("/brain/share", userMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const share = req.body.share;
  if (share) {
    const existingLink = await ShareLinkModel.findOne({
      userId: userId,
    });
    if (existingLink) {
      res.json({
        hash: existingLink?.hash,
      });
    } else {
      const hash = random(10);
      const newLink = await ShareLinkModel.create({
        hash: hash,
        userId: userId,
      });
      res.status(200).json({
        status: "success",
        message: "Link Created",
        data: newLink,
        link: `http://localhost:3000/brain/${hash}`,
      });
    }
  } else {
    await ShareLinkModel.deleteOne({
      userId: userId,
    });
    res.status(200).json({
      status: "success",
      message: "Link Deleted",
    });
  }
});

router.get("/brain/:shareLink",async(req,res)=>{
    const shareLinkHash = req.params.shareLink;
    const link = await ShareLinkModel.findOne({
        hash:shareLinkHash
    }).populate("userId","username");
    if(link){
       const sharedContent = await ContentModel.find({
           userId:link.userId._id
       }).populate("tags","title")
       res.status(200).json({
        status : "success",
        username : link.userId.username,
        sharedContent : sharedContent
       })
    }else{
        res.status(404).json({
            status : "error",
            message : "Share Link is Invalid or Share Link is Expired"
        })
    }
})

export default router;
