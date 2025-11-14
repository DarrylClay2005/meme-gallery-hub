# 🖼️ My Capstone Project Plan: Collaborative Meme Library

**Date:** November 12, 2025

---

## My Project Description and Purpose

**What problem does my project solve?**
My project will provide a centralized, searchable, and collaborative platform for anyone that needs it to store, categorize, and quickly retrieve relevant memes and reaction images, solving the common problem of funny images being scattered across multiple chat threads or folders.

**Who is the target user for my app?**
online communities (e.g., Discord groups), or anyone who needs an organized and shared repository of reaction content. I.e memes

**What makes it interesting or unique?**
The core focus is on **image handling and metadata**. I want to implement robust features allowing users to tag memes, categorize them, and search not just by title, but also by associated tags and the uploading user. The use of cloud storage (S3) will be a key component.

---

## My Planned Backend

**My Stack Choice:**
**Option 1:** Express + Prisma + AWS RDS (PostgreSQL) + **AWS S3** for image storage.

**My Main Models/Tables:**
1.  **User:**
    * `id` (Primary Key)
    * `email` (Unique)
    * `password_hash`
    * `username`
    * `created_at`
2.  **Meme:**
    * `id` (Primary Key)
    * `title`
    * `s3_url` (The URL where the image is stored)
    * `description` (Optional)
    * `is_public` (Boolean: true for public gallery, false for private uploads)
    * `user_id` (Foreign Key to User - The uploader)
    * `created_at`
3.  **Tag:**
    * `id` (Primary Key)
    * `name` (e.g., 'Reaction', 'Programming', 'Doge')
4.  **MemeTag (Junction Table):**
    * `meme_id` (Foreign Key)
    * `tag_id` (Foreign Key)

## My API Routes and Methods

| HTTP Method | Route | Description | Protected? |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | Creates a new user. | No |
| **POST** | `/auth/login` | Logs in user, returns JWT. | No |
| **GET** | `/memes/public` | Returns all public memes (browse gallery). | No |
| **GET** | `/memes/search?q=...` | Searches public memes by title, description, or tags. | No |
| **GET** | `/memes/user` | Returns memes uploaded by my authenticated user. | Yes |
| **POST** | `/memes` | Uploads a new meme (multipart form data, saves to S3). | Yes |
| **GET** | `/memes/:id` | Returns one specific meme detail. | No |
| **PUT** | `/memes/:id` | Updates a meme's title/tags/status (uploader only). | Yes |
| **DELETE** | `/memes/:id` | Deletes a meme and its S3 file (uploader only). | Yes |
| **GET** | `/tags` | Returns a list of all available tags. | No |

---

## My Frontend Features and Pages

**Technology:** React (with React Router), Tailwind CSS for styling.

| Page/Component | Description | Protected? |
| :--- | :--- | :--- |
| **Public Gallery (`/`)** | Main view. Displays public memes in a responsive grid. Includes a search bar and tag filtering sidebar. | No |
| **Meme Detail (`/memes/:id`)** | Full view of a single meme, allowing the user to view tags and copy the image URL. | No |
| **Login/Register (`/auth`)** | Forms for user sign-up and sign-in. | No |
| **Dashboard (`/dashboard`)** | My personal library view. Shows memes uploaded by me, with options to edit or delete them. | Yes |
| **Upload Meme (`/memes/upload`)** | A form supporting file selection, title input, description, tag selection, and public/private toggle. | Yes |

## My Authentication Flow

**Method:** Email/Password (using **JWT**)
1.  **Registration/Login:** User credentials exchanged for a JWT.
2.  **Token Usage:** The JWT is stored on the client and sent in the `Authorization` header for all protected API calls.
3.  **Client Protection:** My frontend routes (`/dashboard`, `/memes/upload`) will check for a valid token before rendering.

**My Protected Routes/Pages:**
* **Backend:** All routes listed as 'Yes' in the API section.
* **Frontend:** `/dashboard` and `/memes/upload`.

---

## My Deployment Plan

| Component | Host | Setup/Notes |
| :--- | :--- | :--- |
| **Frontend** | **Vercel** | Connecting to my GitHub repo. Simple build/deploy of the React app. |
| **Backend API** | **Render** | Connecting to my GitHub repo. Requires Express server setup. |
| **Database** | **AWS RDS (PostgreSQL)** | Managed PostgreSQL instance for my user and meme metadata. |
| **File Storage** | **AWS S3** | A dedicated S3 bucket to store the actual image files. |

**My Known Setup Steps:**
* **Backend ENV:** I need to set up environment variables for `DATABASE_URL`, `JWT_SECRET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `S3_BUCKET_NAME`.
* **AWS:** I must set up the S3 bucket CORS policy and an IAM user with appropriate permissions for S3 read/write.
* **Database:** I will run **Prisma Migrate** for initial schema setup.
* **Frontend ENV:** I need to define the API base URL environment variable (e.g., `VITE_API_BASE_URL`).

---

## My NPM Libraries / Tools

| Component | Tool/Library | Purpose |
| :--- | :--- | :--- |
| **Backend** | **Express** | My main web framework. |
| **Backend** | **Prisma** | My ORM for PostgreSQL database interaction. |
| **Backend** | **Multer** | Middleware for handling `multipart/form-data` (file uploads). |
| **Backend** | **AWS SDK for JS** | Interacting with my S3 service. |
| **Backend** | **jsonwebtoken** (JWT) | Authentication tokens. |
| **Backend** | **Zod** | Schema validation for data integrity. |
| **Frontend** | **React** | My main UI library. |
| **Frontend** | **Tailwind CSS** | Utility-first styling for a clean gallery aesthetic. |
| **Frontend** | **React Query** | Data fetching, caching, and state management for quick gallery loading. |
| **Frontend** | **Axios** | HTTP client for making API calls. |
| **Frontend** | **React Dropzone** | Component for easy drag-and-drop file uploads. |