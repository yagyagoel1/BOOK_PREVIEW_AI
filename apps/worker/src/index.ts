import { Worker, Job } from "bullmq";
import { generalConfig, redisConnection } from '@repo/lib/src';
import dotenv from 'dotenv';
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

import { getPresignedUrl } from './utils/getS3Url';
import { analyzeBookCover } from './utils/getBookDetails';
import { getGenreType, searchBook } from './utils/searchGoogleBooks';
import { downloadPreviewPages } from './utils/getPagesFromPreview';
import { findBestMatchingBook } from './utils/gettingTheBestPreview';
import { doOCR } from './utils/OCR';
import { isMainContent, snippetBuilder } from './utils/giveTheRelevantPages';
import { uploadImageToS3 } from './utils/uploadImageToS3';
import { 
  CacheData, 
  getFromBookCache, 
  pushToCache, 
  setStatus, 
  setCheckpoint, 
  getCheckpoint, 
  clearCheckpoint, 
  cleanupStaleCheckpoints 
} from "./utils/redis";

dotenv.config();


cleanupStaleCheckpoints().then(() => {
  console.log('Checkpoint cleanup completed on startup');
});

setInterval(() => {
  cleanupStaleCheckpoints().catch(error => {
    console.log('Periodic checkpoint cleanup failed:', error);
  });
}, 6 * 60 * 60 * 1000);



const processBookTask = async (taskId: string, taskStartTime: number, taskData: { id: string, path: string }) => {
  const savedCheckpoint = await getCheckpoint(taskId);
  let currentProcessingStep = savedCheckpoint?.step || 'start';
  let processingData = savedCheckpoint?.data || {};

  console.log(`Starting/Resuming job ${taskId} from step: ${currentProcessingStep}`);

  try {
    if (currentProcessingStep === 'start') {
      console.log('Step 1: Getting presigned URL');
      
      processingData.presignedUrl = await getPresignedUrl(taskData.path);
      await setCheckpoint(taskId, 'presigned_url_ready', processingData);
      currentProcessingStep = 'presigned_url_ready';
    }

    if (currentProcessingStep === 'presigned_url_ready') {
      console.log('Step 2: Analyzing book cover');
      setStatus(taskId, {
        status: "pending",
        message: "getting info about the book"
      });
      
      const bookCoverAnalysis = await analyzeBookCover(processingData.presignedUrl);
      console.log(bookCoverAnalysis);
      
      const extractedBookDetails = bookCoverAnalysis?.details;
      
      if (bookCoverAnalysis?.isBlurry?.toUpperCase() === 'YES') {
        await setStatus(taskId, { 
          status: "failed", 
          message: "image too blurry please reupload" 
        });
        await clearCheckpoint(taskId);
        return;
      }
      
      if (bookCoverAnalysis?.isCover?.toUpperCase() === 'NO') {
        await setStatus(taskId, { 
          status: "failed", 
          message: "cover not found please reupload" 
        });
        await clearCheckpoint(taskId);
        return;
      }
      
      if (!extractedBookDetails?.title) {
        throw new Error("book title not found");
      }
      
      processingData.bookDetails = extractedBookDetails;
      await setCheckpoint(taskId, 'book_analyzed', processingData);
      currentProcessingStep = 'book_analyzed';
    }

    if (currentProcessingStep === 'book_analyzed') {
      console.log('Step 3: Checking cache');
      const cachedBookData = await getFromBookCache(processingData.bookDetails.title);
      console.log(cachedBookData, "book from cache");
      
      if (cachedBookData) {
        let bestMatchFromCache = cachedBookData[0];
        
        if (processingData.bookDetails?.author) {
          const authorMatch = cachedBookData.find((cachedBook: CacheData) => {
            return cachedBook.author === processingData.bookDetails.author;
          });
          
          if (authorMatch) {
            bestMatchFromCache = authorMatch;
          }
        }
        
        await setStatus(taskId, {
          status: "completed",
          data: {
            text: bestMatchFromCache.text,
            author: bestMatchFromCache.author as string,
            title: processingData.bookDetails.title as string,
            category: bestMatchFromCache.category,
            imageUrl: bestMatchFromCache.imageUrl || undefined
          },
          message: "Processed Successfully"
        });
        await clearCheckpoint(taskId);
        return;
      }
      
      await setCheckpoint(taskId, 'cache_checked', processingData);
      currentProcessingStep = 'cache_checked';
    }

    if (currentProcessingStep === 'cache_checked') {
      console.log('Step 4: Searching for books');
      setStatus(taskId, {
        status: "pending",
        message: "got details about the book searching about the book"
      });
      
      const searchResults = await searchBook(
        processingData.bookDetails?.title,
        processingData.bookDetails?.author ? processingData.bookDetails.author : null
      );
      
      if (!searchResults.length) {
        await setStatus(taskId, {
          status: "failed",
          message: "Book not found"
        });
        await clearCheckpoint(taskId);
        return;
      }
      
      processingData.searchResults = searchResults;
      await setCheckpoint(taskId, 'books_searched', processingData);
      currentProcessingStep = 'books_searched';
    }

    if (currentProcessingStep === 'books_searched') {
      console.log('Step 5: Finding best matching book');
      setStatus(taskId, {
        status: "pending",
        message: "finding the best match"
      });
      
      let bestBookMatch;
      try {
        bestBookMatch = await findBestMatchingBook(processingData.bookDetails, processingData.searchResults);
        if (!bestBookMatch.previewLink) {
          throw new Error("previewLink Not Found");
        }
      } catch (error) {
        console.log("preview link not found");
        bestBookMatch = {
          previewLink: processingData.searchResults?.[0]?.volumeInfo?.previewLink,
          author: processingData.searchResults?.[0]?.volumeInfo?.authors?.join(","),
          title: processingData.searchResults?.[0]?.volumeInfo?.title,
          category: getGenreType(processingData.searchResults?.[0]?.volumeInfo?.categories)
        };
      }
      
      processingData.bestBookMatch = bestBookMatch;
      await setCheckpoint(taskId, 'best_match_found', processingData);
      currentProcessingStep = 'best_match_found';
    }

    if (currentProcessingStep === 'best_match_found') {
      console.log('Step 6: Downloading preview pages');
      setStatus(taskId, {
        status: "pending",
        message: "getting your preview"
      });
      
      await downloadPreviewPages(processingData.bestBookMatch?.previewLink, taskId);
      await setCheckpoint(taskId, 'preview_downloaded', processingData);
      currentProcessingStep = 'preview_downloaded';
    }

    if (currentProcessingStep === 'preview_downloaded') {
      console.log('Step 7: Performing OCR');
      setStatus(taskId, {
        status: "pending",
        message: "processing your preview"
      });
      
      const textExtractionResults = await doOCR(taskId);
      processingData.textExtractionResults = textExtractionResults;
      await setCheckpoint(taskId, 'ocr_completed', processingData);
      currentProcessingStep = 'ocr_completed';
    }

    if (currentProcessingStep === 'ocr_completed') {
      console.log('Step 8: Processing content and finalizing');
      const contentSnippetForAI = snippetBuilder(
        processingData.textExtractionResults,
        processingData.bestBookMatch.category.toLowerCase() === generalConfig.FICTION ? 1 : 2
      );
      
      const selectedContentPage = await isMainContent(contentSnippetForAI);
      
      if (selectedContentPage && selectedContentPage.file) {
        const matchingPage = processingData.textExtractionResults.filter((extractedText: any) => {
          return selectedContentPage.file === extractedText.filename;
        })[0];
        
        const finalTextContent = matchingPage.text;
        const selectedImagePath = path.join(__dirname, taskId, selectedContentPage.file);
        const uploadedImageUrl = await uploadImageToS3(selectedImagePath);

        try {
          if (fs.existsSync(path.join(__dirname, taskId))) {
            fs.rmSync(path.join(__dirname, taskId), { recursive: true, force: true });
          }
        } catch (error) {
          console.warn('fs.rmSync failed, using alternative cleanup method:', error);
          try {
            execSync(`rm -rf "${path.join(__dirname, taskId)}"`, { stdio: 'ignore' });
          } catch (fallbackError) {
            console.error('Failed to cleanup directory:', fallbackError);
          }
        }
      
        await setStatus(taskId, {
          status: "completed",
          data: {
            text: finalTextContent,
            author: processingData.bestBookMatch.author as string,
            title: processingData.bestBookMatch.title as string,
            category: processingData.bestBookMatch.category === "fiction" ? "fiction" : "non-fiction",
            imageUrl: uploadedImageUrl || undefined
          },
          message: "Processed Successfully"
        });
        
        await pushToCache(processingData.bestBookMatch.title, {
          author: processingData.bestBookMatch.author as string,
          category: processingData.bestBookMatch.category,
          imageUrl: uploadedImageUrl || undefined,
          text: finalTextContent
        });
        
        await clearCheckpoint(taskId);
      }
    }
    
  } catch (error) {
    console.log('Error in processBookTask:', error);
    throw new Error("Error while processing");
  }
}

const bookProcessingWorker = new Worker(
  process.env.QUEUE_NAME as string,
  async (job: Job) => {
    const jobData = job.data;
    const jobStartTime = performance.now();
    await processBookTask(job.id || "fallback-job-id", jobStartTime, jobData);
  },
  {
    connection: redisConnection,
    removeOnComplete: {
      age: 3600,
      count: 500,
    },
    removeOnFail: {
      age: 24 * 3600,
    }
  }
);

bookProcessingWorker.on("completed", (job: Job) => {
  console.log(`Job with id ${job.id} has been completed`);
});

bookProcessingWorker.on("failed", async (job, error: Error) => {
  console.log(error);
  console.log(`Job with id ${job?.id} has failed with error ${error.message}`);
  
  if (job?.id) {
    const savedCheckpoint = await getCheckpoint(job.id);
    if (savedCheckpoint) {
      console.log(`Job was at step: ${savedCheckpoint.step} when it failed`);
    }
  }

  if (job && job.attemptsMade >= (job.opts.attempts || 3)) {
    console.log("it was the last retry");
    await setStatus(job.id || "unknown", {
      status: "failed",
      message: `Processing failed after ${job.attemptsMade} attempts: ${error.message}`
    });
    
    if (job.id) {
      await clearCheckpoint(job.id);
    
     try {
          if (fs.existsSync(path.join(__dirname, job.id ))) {
            fs.rmSync(path.join(__dirname, job.id ), { recursive: true, force: true });
          }
        } catch (error) {
          console.warn('fs.rmSync failed, using alternative cleanup method:', error);
          try {
            execSync(`rm -rf "${path.join(__dirname, job.id )}"`, { stdio: 'ignore' });
          } catch (fallbackError) {
            console.error('Failed to cleanup directory:', fallbackError);
          }
        }
      }
  } else if (job && job.id) {
    await setStatus(job.id, {
      status: "retrying",
      message: "failed to process your book Dont worry wee are retrying"
    });
  }
});