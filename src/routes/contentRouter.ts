import express from "express";
import { userMiddleware } from "../middleware/userMiddleware";
import { ContentModel, TagModel } from "../db/db";
import { error } from "console";
const router = express.Router({ mergeParams: true });

router.post("/content", userMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  console.log("userId in content", userId);
  if (!userId) {
    res.status(403).json({
      status: "error",
      message: "Unauthorized Access!",
    });
  } else {
    try {
      // create tag if they are not present and assign there ids to content
      const tags = req.body.tags || [];
      const tagIds = [];

      for (const TagTitle of tags) {
        let tag = await TagModel.findOne({ title: TagTitle });
        if (!tag) {
          tag = await TagModel.create({ title: TagTitle });
        }
        tagIds.push(tag._id);
      }

      // create youtube embed link and sending the embed url
      if (req.body.type === "youtube") {
        let youtubeLink = req.body.link;
        let youtubeID = youtubeLink.split("/");
        youtubeID = youtubeID[youtubeID.length - 1];
        let finalYoutubeId = youtubeID.split("?")[0];
        req.body.link = `https://www.youtube.com/embed/${finalYoutubeId}`;
      }

      console.log(req.body.tags);
      await ContentModel.create({
        title: req.body.title,
        link: req.body.link,
        type: req.body.type,
        tags: tagIds,
        userId,
      });

      res.status(200).json({
        status: "success",
        message: "Content Created",
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  }
});

router.get("/content", userMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) {
    res.status(403).json({
      status: "error",
      message: "Unauthorized Access!",
    });
  } else {
    try {
      const contents = await ContentModel.find({
        userId: userId,
      })
        .populate("tags", "title")
        .populate("userId", "username");

      res.status(200).json({
        status : "success",
        message: "Content Fetched",
        contents: contents,
      });
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

router.delete("/content", userMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) {
    res.status(403).json({
      status: "error",
      message: "Unauthorized Access!",
    });
  } else {
    try {
      const result = await ContentModel.deleteMany({ userId });
      if (result.deletedCount === 0) {
        res.status(404).json({
          message: "No Content Found",
        });
      }
      res.status(200).json({
        status: "success",
        message: "All Content Deleted",
        data: result,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  }
});

router.delete("/content/:contentId", userMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const contentId = req.params.contentId;
  if (!userId) {
    res.status(403).json({
      status: "error",
      message: "Unauthorized Access!",
    });
  } else {
    try {
      const deletedContent = await ContentModel.findOneAndDelete({
        _id: contentId,
        userId: userId,
      });

      if (!deletedContent) {
        res.status(404).json({
          status: "error",
          message: "Content not found or already deleted",
        });
      }

      res.status(200).json({
        status: "success",
        message: "Content Deleted",
        data: deletedContent,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  }
});

export default router;
