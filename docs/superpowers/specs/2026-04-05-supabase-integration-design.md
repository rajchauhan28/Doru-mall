# Design Spec: Supabase Integration for DoruMart

Transitioning DoruMart from browser `localStorage` to a persistent cloud database using Supabase to ensure data durability across Vercel deployments.

## 1. Architecture Overview

- **Frontend:** Single-page HTML/JS (existing `index.html`).
- **Backend:** Supabase (PostgreSQL + Storage).
- **Integration:** Supabase JavaScript Client (CDN).

## 2. Database Schema (PostgreSQL)

### Table: `shops`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key (Default: gen_random_uuid()) |
| `created_at` | timestamp | Default: now() |
| `name` | text | |
| `image_url` | text | URL to Supabase Storage |
| `status` | text | 'pending' or 'approved' |
| `owner` | text | Email of the vendor |

### Table: `products`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `shop_id` | uuid | Foreign Key (shops.id) |
| `name` | text | |
| `price` | numeric | |
| `image_url` | text | URL to Supabase Storage |

### Table: `orders`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | text | Custom ID (ORD-XXXXXX) |
| `created_at` | timestamp | |
| `total` | numeric | |
| `items` | jsonb | Array of ordered items |
| `customer` | jsonb | {name, phone, address} |
| `status` | text | |

## 3. Storage Strategy

- **Bucket:** `dorumart-assets`
- **Logic:** Replace Base64 encoding with direct uploads to Supabase Storage. File paths will be `shops/{shop_id}` and `products/{product_id}`.

## 4. Implementation Plan

1.  **Initialization:** Inject Supabase SDK via CDN and initialize with project credentials.
2.  **Data Migration:** Create helper functions to sync existing `localStorage` data to Supabase (one-time migration).
3.  **Refactor State:**
    *   `saveState()` -> `syncToSupabase()`
    *   `renderShops()` / `openShop()` -> Fetch from Supabase tables.
4.  **Vendor Portal:** Update `submitShop()` and `saveProduct()` to handle file uploads to Storage.
5.  **Orders:** Update `completeOrder()` to insert into the `orders` table.

## 5. Security & Constraints

- **API Keys:** Use `SUPABASE_URL` and `SUPABASE_ANON_KEY`. 
- **RLS:** For this phase, we will assume public access for simplicity, but recommend Row Level Security (RLS) for production.
- **GitHub Push:** Initialize Git, add remote `https://github.com/rajchauhan28/Doru-mall`, and push.
