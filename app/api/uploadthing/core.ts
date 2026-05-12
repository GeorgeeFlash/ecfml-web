import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new UploadThingError("Unauthorized");
  return { userId };
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  consumptionDataset: f({
    blob: {
      maxFileSize: "32MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      // This code runs on your server before upload
      return requireUser();
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      const fileUrl = file.ufsUrl ?? file.url;
      return { uploadedBy: metadata.userId, fileUrl };
    }),
  weatherDataset: f({
    blob: {
      maxFileSize: "32MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      return requireUser();
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const fileUrl = file.ufsUrl ?? file.url;
      return { uploadedBy: metadata.userId, fileUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
